import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''

    const dateFilter: any = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.gte = new Date(startDate)
      if (endDate) dateFilter.createdAt.lte = new Date(endDate)
    }

    if (type === 'revenue') {
      const sales = await db.sale.findMany({
        where: Object.keys(dateFilter).length > 0 ? dateFilter : {},
        include: { items: true, branch: { select: { name: true } } },
      })

      const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0)
      const totalTax = sales.reduce((sum, s) => sum + s.taxAmount, 0)
      const totalDiscount = sales.reduce((sum, s) => sum + s.discountAmount, 0)
      const totalCost = sales.reduce((sum, s) => sum + s.items.reduce((si, i) => si + i.costPrice * i.quantity, 0), 0)
      const grossProfit = totalRevenue - totalCost

      // By payment method
      const byPayment = sales.reduce((acc, s) => {
        acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.totalAmount
        return acc
      }, {} as Record<string, number>)

      // By branch
      const byBranch = sales.reduce((acc, s) => {
        const name = s.branch?.name || 'Unknown'
        acc[name] = (acc[name] || 0) + s.totalAmount
        return acc
      }, {} as Record<string, number>)

      // Daily breakdown
      const dailyBreakdown = sales.reduce((acc, s) => {
        const day = s.createdAt.toISOString().split('T')[0]
        if (!acc[day]) acc[day] = { revenue: 0, cost: 0, count: 0 }
        acc[day].revenue += s.totalAmount
        acc[day].cost += s.items.reduce((si, i) => si + i.costPrice * i.quantity, 0)
        acc[day].count++
        return acc
      }, {} as Record<string, { revenue: number; cost: number; count: number }>)

      return NextResponse.json({
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100,
        totalDiscount: Math.round(totalDiscount * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        grossMargin: totalRevenue > 0 ? Math.round(grossProfit / totalRevenue * 100 * 10) / 10 : 0,
        totalTransactions: sales.length,
        avgTransactionValue: sales.length > 0 ? Math.round(totalRevenue / sales.length * 100) / 100 : 0,
        byPayment,
        byBranch,
        dailyBreakdown: Object.entries(dailyBreakdown).map(([date, data]) => ({ date, ...data })).sort((a, b) => a.date.localeCompare(b.date)),
      })
    }

    if (type === 'inventory') {
      const inventory = await db.inventory.findMany({
        include: {
          medicine: { select: { name: true, sku: true, price: true, costPrice: true, category: { select: { name: true } } } },
          branch: { select: { name: true } },
        }
      })

      const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0)
      const totalValue = inventory.reduce((sum, i) => sum + i.sellingPrice * i.quantity, 0)
      const totalCost = inventory.reduce((sum, i) => sum + i.costPrice * i.quantity, 0)
      const byStatus = inventory.reduce((acc, i) => {
        acc[i.status] = (acc[i.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const byCategory = inventory.reduce((acc, i) => {
        const name = i.medicine.category.name
        if (!acc[name]) acc[name] = { count: 0, value: 0, qty: 0 }
        acc[name].count++
        acc[name].value += i.sellingPrice * i.quantity
        acc[name].qty += i.quantity
        return acc
      }, {} as Record<string, { count: number; value: number; qty: number }>)

      return NextResponse.json({
        totalBatches: inventory.length,
        totalItems,
        totalValue: Math.round(totalValue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        byStatus,
        byCategory: Object.entries(byCategory).map(([name, data]) => ({ name, ...data })),
      })
    }

    // Default overview
    const totalSales = await db.sale.count()
    const totalRevenue = (await db.sale.findMany()).reduce((sum, s) => sum + s.totalAmount, 0)
    const totalExpenses = (await db.expense.findMany()).reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalRevenue - totalExpenses

    return NextResponse.json({
      totalSales,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
    })
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
