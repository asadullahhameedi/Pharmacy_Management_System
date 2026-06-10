import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const paymentMethod = searchParams.get('paymentMethod') || ''
    const paymentStatus = searchParams.get('paymentStatus') || ''
    const saleType = searchParams.get('saleType') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (search) where.invoiceNumber = { contains: search }
    if (paymentMethod) where.paymentMethod = paymentMethod
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (saleType) where.saleType = saleType
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [sales, total] = await Promise.all([
      db.sale.findMany({
        where,
        include: {
          customer: { select: { name: true, phone: true } },
          cashier: { select: { name: true } },
          branch: { select: { name: true } },
          items: { include: { medicine: { select: { name: true, sku: true } } } },
          prescription: { select: { prescriptionNumber: true } },
          refund: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.sale.count({ where }),
    ])

    return NextResponse.json({
      sales,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Sales API error:', error)
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { customerId, cashierId, branchId, items, paymentMethod, paymentStatus, saleType, discountAmount, notes } = data

    let subtotal = 0
    let taxAmount = 0
    const saleItems = []

    for (const item of items) {
      const medicine = await db.medicine.findUnique({ where: { id: item.medicineId } })
      if (!medicine) continue

      const itemTotal = medicine.price * item.quantity
      const itemTax = itemTotal * medicine.taxRate / 100
      const itemDiscount = itemTotal * (item.discount || 0) / 100

      subtotal += itemTotal
      taxAmount += itemTax

      saleItems.push({
        medicineId: medicine.id,
        batchNumber: item.batchNumber || null,
        quantity: item.quantity,
        unitPrice: medicine.price,
        costPrice: medicine.costPrice,
        discount: item.discount || 0,
        taxRate: medicine.taxRate,
        totalPrice: itemTotal + itemTax - itemDiscount,
      })
    }

    const totalAmount = subtotal + taxAmount - (discountAmount || 0)
    const lastSale = await db.sale.findFirst({ orderBy: { invoiceNumber: 'desc' } })
    const invoiceNumber = `INV-${String(parseInt(lastSale?.invoiceNumber?.replace('INV-', '') || '100000') + 1).padStart(6, '0')}`

    const sale = await db.sale.create({
      data: {
        invoiceNumber,
        branchId,
        customerId: customerId || null,
        cashierId,
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        discountAmount: Math.round((discountAmount || 0) * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        paidAmount: Math.round(totalAmount * 100) / 100,
        changeAmount: 0,
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: paymentStatus || 'paid',
        saleType: saleType || 'pos',
        notes,
        items: { create: saleItems },
      },
      include: {
        items: { include: { medicine: { select: { name: true } } } },
        customer: { select: { name: true } },
      }
    })

    // Update customer loyalty
    if (customerId) {
      await db.customer.update({
        where: { id: customerId },
        data: {
          totalSpent: { increment: totalAmount },
          totalOrders: { increment: 1 },
          loyaltyPoints: { increment: Math.floor(totalAmount / 100) },
        }
      })
    }

    // Log activity
    await db.activityLog.create({
      data: { userId: cashierId, action: 'CREATE', entity: 'Sale', entityId: sale.id, details: `Created sale ${invoiceNumber}` }
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error('Create sale error:', error)
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 })
  }
}
