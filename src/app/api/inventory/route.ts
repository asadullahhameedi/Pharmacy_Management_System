import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const branchId = searchParams.get('branchId') || ''
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status) where.status = status
    if (branchId) where.branchId = branchId
    if (search) {
      where.medicine = {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
          { genericName: { contains: search } },
        ]
      }
    }

    const [inventory, total] = await Promise.all([
      db.inventory.findMany({
        where,
        include: {
          medicine: { select: { name: true, sku: true, barcode: true, unit: true, minStock: true, maxStock: true, category: { select: { name: true } } } },
          branch: { select: { name: true, code: true } },
          warehouse: { select: { name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      db.inventory.count({ where }),
    ])

    return NextResponse.json({
      inventory,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Inventory API error:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const inventory = await db.inventory.create({ data })
    return NextResponse.json(inventory, { status: 201 })
  } catch (error) {
    console.error('Create inventory error:', error)
    return NextResponse.json({ error: 'Failed to create inventory' }, { status: 500 })
  }
}
