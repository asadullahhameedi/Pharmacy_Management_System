import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const supplierId = searchParams.get('supplierId') || ''
    const prescriptionRequired = searchParams.get('prescriptionRequired')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { genericName: { contains: search } },
        { brandName: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
      ]
    }
    if (categoryId) where.categoryId = categoryId
    if (supplierId) where.supplierId = supplierId
    if (prescriptionRequired !== null && prescriptionRequired !== '') where.prescriptionRequired = prescriptionRequired === 'true'
    if (isActive !== null && isActive !== '') where.isActive = isActive === 'true'

    const [medicines, total] = await Promise.all([
      db.medicine.findMany({
        where,
        include: {
          category: { select: { name: true, color: true, icon: true } },
          supplier: { select: { name: true, code: true } },
          inventory: { select: { quantity: true, batchNumber: true, expiryDate: true, status: true, sellingPrice: true } },
          reviews: { select: { rating: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      db.medicine.count({ where }),
    ])

    // Add computed fields
    const enrichedMedicines = medicines.map(med => {
      const totalStock = med.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
      const avgRating = med.reviews.length > 0 ? med.reviews.reduce((sum, r) => sum + r.rating, 0) / med.reviews.length : 0
      const nearestExpiry = med.inventory
        .filter(inv => inv.expiryDate && new Date(inv.expiryDate) > new Date())
        .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())[0]?.expiryDate || null
      return { ...med, totalStock, avgRating: Math.round(avgRating * 10) / 10, nearestExpiry, reviewCount: med.reviews.length }
    })

    return NextResponse.json({
      medicines: enrichedMedicines,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Medicines API error:', error)
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const medicine = await db.medicine.create({ data })
    return NextResponse.json(medicine, { status: 201 })
  } catch (error) {
    console.error('Create medicine error:', error)
    return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 })
  }
}
