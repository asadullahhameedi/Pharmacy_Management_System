import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Total counts
    const totalMedicines = await db.medicine.count()
    const totalCustomers = await db.customer.count()
    const totalSales = await db.sale.count()
    const totalOrders = await db.order.count()
    const totalBranches = await db.branch.count()
    const totalEmployees = await db.user.count()

    // Revenue calculations
    const sales = await db.sale.findMany()
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0)
    const todaySales = sales.filter(s => {
      const today = new Date()
      return s.createdAt.toDateString() === today.toDateString()
    })
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0)

    // Recent sales
    const recentSales = await db.sale.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true } },
        cashier: { select: { name: true } },
        items: { include: { medicine: { select: { name: true } } } },
      }
    })

    // Low stock items
    const lowStockInventory = await db.inventory.findMany({
      where: { status: 'low_stock' },
      take: 10,
      include: { medicine: { select: { name: true, sku: true, minStock: true } } }
    })

    // Expiring soon
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    const expiringSoon = await db.inventory.findMany({
      where: {
        expiryDate: { lte: thirtyDaysFromNow, gt: new Date() },
        status: 'in_stock',
      },
      take: 10,
      include: { medicine: { select: { name: true, sku: true } } }
    })

    // Expired
    const expiredItems = await db.inventory.findMany({
      where: { status: 'expired' },
      take: 10,
      include: { medicine: { select: { name: true, sku: true } } }
    })

    // Category distribution
    const categoryStats = await db.medicine.findMany({
      include: { category: { select: { name: true, color: true } } },
    })
    const categoryMap = new Map<string, { name: string; color: string; count: number; value: number }>()
    for (const med of categoryStats) {
      const key = med.category.name
      if (!categoryMap.has(key)) {
        categoryMap.set(key, { name: med.category.name, color: med.category.color || '#6b7280', count: 0, value: 0 })
      }
      const entry = categoryMap.get(key)!
      entry.count++
      // Calculate total inventory value
      const inv = await db.inventory.findMany({ where: { medicineId: med.id } })
      entry.value += inv.reduce((s, i) => s + i.sellingPrice * i.quantity, 0)
    }

    // Monthly sales data (last 6 months)
    const monthlySales: { month: string; revenue: number; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStr = date.toLocaleString('default', { month: 'short', year: 'numeric' })
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)

      const monthSalesRecords = sales.filter(s => s.createdAt >= monthStart && s.createdAt <= monthEnd)
      monthlySales.push({
        month: monthStr,
        revenue: monthSalesRecords.reduce((sum, s) => sum + s.totalAmount, 0),
        count: monthSalesRecords.length,
      })
    }

    // Daily sales this week
    const dailySales: { day: string; revenue: number; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      const daySales = sales.filter(s => s.createdAt.toDateString() === date.toDateString())
      dailySales.push({
        day: dayStr,
        revenue: daySales.reduce((sum, s) => sum + s.totalAmount, 0),
        count: daySales.length,
      })
    }

    // Top selling medicines
    const saleItems = await db.saleItem.findMany({
      include: { medicine: { select: { name: true, sku: true } } },
    })
    const medicineSalesMap = new Map<string, { name: string; sku: string; totalQty: number; totalRevenue: number }>()
    for (const item of saleItems) {
      if (!medicineSalesMap.has(item.medicineId)) {
        medicineSalesMap.set(item.medicineId, { name: item.medicine.name, sku: item.medicine.sku, totalQty: 0, totalRevenue: 0 })
      }
      const entry = medicineSalesMap.get(item.medicineId)!
      entry.totalQty += item.quantity
      entry.totalRevenue += item.totalPrice
    }
    const topSellingMedicines = Array.from(medicineSalesMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 8)

    // Payment method distribution
    const paymentMethods = sales.reduce((acc, s) => {
      acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.totalAmount
      return acc
    }, {} as Record<string, number>)

    // Inventory value
    const allInventory = await db.inventory.findMany()
    const totalInventoryValue = allInventory.reduce((sum, i) => sum + i.sellingPrice * i.quantity, 0)
    const totalInventoryCost = allInventory.reduce((sum, i) => sum + i.costPrice * i.quantity, 0)

    // Notifications
    const notifications = await db.notification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    })

    // Recent orders
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true, phone: true } } },
    })

    // Activity logs
    const activities = await db.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, avatar: true } } },
    })

    return NextResponse.json({
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        totalMedicines,
        totalCustomers,
        totalSales,
        totalOrders,
        totalBranches,
        totalEmployees,
        totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
        totalInventoryCost: Math.round(totalInventoryCost * 100) / 100,
        lowStockCount: lowStockInventory.length,
        expiringCount: expiringSoon.length,
        expiredCount: expiredItems.length,
      },
      recentSales,
      lowStockItems: lowStockInventory,
      expiringSoon,
      expiredItems,
      categoryStats: Array.from(categoryMap.values()),
      monthlySales,
      dailySales,
      topSellingMedicines,
      paymentMethods,
      notifications,
      recentOrders,
      activities,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 })
  }
}
