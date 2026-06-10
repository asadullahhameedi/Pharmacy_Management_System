import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const promotions = await db.promotion.findMany({
      where: { isActive: true, endDate: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(promotions)
  } catch (error) {
    console.error('Promotions API error:', error)
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 })
  }
}
