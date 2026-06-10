import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status) where.status = status
    if (search) where.prescriptionNumber = { contains: search }

    const [prescriptions, total] = await Promise.all([
      db.prescription.findMany({
        where,
        include: {
          customer: { select: { name: true, phone: true } },
          prescribedByUser: { select: { name: true } },
          items: { include: { medicine: { select: { name: true, price: true } } } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.prescription.count({ where }),
    ])

    return NextResponse.json({ prescriptions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error('Prescriptions API error:', error)
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 })
  }
}
