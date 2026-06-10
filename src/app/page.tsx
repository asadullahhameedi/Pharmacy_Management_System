'use client'

import { useEffect, useState, useCallback } from 'react'
import { useStore, ViewMode, AdminTab } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Pill, FileText, BarChart3, Settings, Bell,
  LogOut, Search, Plus, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle,
  Clock, ArrowUpRight, ArrowDownRight, Store, ChevronRight, Filter, Download, Upload,
  Truck, Calendar, Activity, Eye, Edit, Trash2, RefreshCcw, Menu, X, Sun, Moon,
  Heart, Star, MapPin, Phone, Mail, Globe, Shield, BoxIcon, QrCode, Mic,
  Warehouse, UserCheck, Receipt, CreditCard, Banknote, Smartphone, FileBarChart,
  ChevronDown, Home, Tag, Gift, MessageCircle, HelpCircle, Info, Zap, Target,
  ClipboardList, Stethoscope, Building2, TruckIcon, UserCircle, Hash, Percent
} from 'lucide-react'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Area, AreaChart, ResponsiveContainer } from 'recharts'

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-AF', { style: 'currency', currency: 'AFN', minimumFractionDigits: 0 }).format(amount)
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    in_stock: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    low_stock: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    out_of_stock: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    partial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    refunded: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    processing: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    confirmed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    absent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dispensed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    verified: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  }
  return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

// ============================================================
// API HELPER
// ============================================================

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  return res.json()
}

// ============================================================
// LOGIN PAGE
// ============================================================

function LoginPage() {
  const { setAuth, setViewMode } = useStore()
  const [email, setEmail] = useState('admin@zargoon.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [needsSeed, setNeedsSeed] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setAuth(data.user, data.accessToken)
      toast.success('Welcome back, ' + data.user.name)
    } catch (err: any) {
      if (err.message?.includes('Invalid credentials')) {
        setNeedsSeed(true)
      }
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await apiFetch('/auth/seed', { method: 'POST' })
      toast.success('Database seeded! Please login.')
      setNeedsSeed(false)
    } catch (err: any) {
      toast.error('Seed failed: ' + err.message)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-bold shadow-xl shadow-emerald-500/25 mb-4">
            ZG
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Zargoon Pharmacy
          </h1>
          <p className="text-muted-foreground mt-2">Enterprise Pharmacy Management System</p>
        </div>

        <Card className="border-0 shadow-2xl shadow-black/5 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@zargoon.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {needsSeed && (
              <Alert className="mt-4 border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 dark:text-amber-400">
                  Database needs to be seeded first.
                  <Button size="sm" onClick={handleSeed} disabled={seeding} className="ml-2 bg-amber-600 hover:bg-amber-700">
                    {seeding ? 'Seeding...' : 'Seed Database'}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm space-y-1">
              <p className="font-medium text-muted-foreground mb-2">Demo Accounts:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span className="text-muted-foreground">Super Admin:</span><span>admin@zargoon.com</span>
                <span className="text-muted-foreground">Manager:</span><span>manager@zargoon.com</span>
                <span className="text-muted-foreground">Pharmacist:</span><span>pharmacist@zargoon.com</span>
                <span className="text-muted-foreground">Cashier:</span><span>cashier@zargoon.com</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Password for all: admin123</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={() => setViewMode('store')}>
              <Store className="mr-2 h-4 w-4" /> Visit Online Pharmacy
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Developed by <span className="font-medium">Asadullah Hameedi</span></p>
          <p>Kabul, Afghanistan</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <a href="https://github.com/asadullahhameeedi/" target="_blank" className="hover:text-emerald-600 transition-colors">GitHub</a>
            <span>·</span>
            <a href="https://www.linkedin.com/in/as" target="_blank" className="hover:text-emerald-600 transition-colors">LinkedIn</a>
            <span>·</span>
            <a href="https://x.com/AsadullahHzmd" target="_blank" className="hover:text-emerald-600 transition-colors">X</a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ADMIN SIDEBAR
// ============================================================

function AdminSidebar() {
  const { adminTab, setAdminTab, sidebarOpen, setSidebarOpen, user, logout, setViewMode } = useStore()
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (user?.id) {
      apiFetch(`/notifications?userId=${user.id}`).then(data => setNotifications(data.notifications || [])).catch(() => {})
    }
  }, [user?.id])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const menuItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'sales', label: 'Sales & POS', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Online Orders', icon: Truck },
    { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
    { id: 'employees', label: 'Employees', icon: UserCheck },
    { id: 'suppliers', label: 'Suppliers', icon: Building2 },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'branches', label: 'Branches', icon: Warehouse },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-gray-950 border-r border-border shadow-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">ZG</div>
                <div>
                  <h2 className="font-bold text-sm">Zargoon Pharmacy</h2>
                  <p className="text-xs text-muted-foreground">Management System</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">{user?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <Badge variant="outline" className="text-[10px] h-5 mt-0.5">{user?.role?.replace('_', ' ')}</Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-2">
            <nav className="space-y-1">
              {menuItems.map(item => {
                const Icon = item.icon
                const isActive = adminTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => { setAdminTab(item.id); setSidebarOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm'
                        : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600' : ''}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <Badge className="h-5 px-1.5 text-[10px] bg-red-500 text-white">{item.badge}</Badge>
                    ) : null}
                  </button>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <Button variant="outline" className="w-full justify-start text-sm" onClick={() => setViewMode('store')}>
              <Store className="mr-2 h-4 w-4" /> Online Store
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

// ============================================================
// ADMIN HEADER
// ============================================================

function AdminHeader() {
  const { setSidebarOpen, adminTab, darkMode, toggleDarkMode } = useStore()
  const tabLabels: Record<AdminTab, string> = {
    dashboard: 'Dashboard',
    inventory: 'Inventory Management',
    medicines: 'Medicine Catalog',
    sales: 'Sales & POS',
    customers: 'Customer Management',
    employees: 'Employee Management',
    orders: 'Online Orders',
    prescriptions: 'Prescriptions',
    reports: 'Reports & Analytics',
    suppliers: 'Suppliers',
    expenses: 'Expenses',
    settings: 'System Settings',
    notifications: 'Notifications',
    branches: 'Branches & Warehouses',
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">{tabLabels[adminTab]}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Zargoon Pharmacy Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="text-xs text-muted-foreground hidden md:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
    </header>
  )
}

// ============================================================
// DASHBOARD PAGE
// ============================================================

function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/dashboard').then(d => setData(d)).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) return <div className="p-6 text-center text-muted-foreground">Failed to load dashboard data</div>

  const { stats, recentSales, dailySales, topSellingMedicines, categoryStats, notifications, activities, lowStockItems, expiringSoon, recentOrders } = data

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, change: '+12.5%', up: true, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
          { title: 'Today\'s Revenue', value: formatCurrency(stats.todayRevenue), icon: TrendingUp, change: '+8.2%', up: true, color: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/25' },
          { title: 'Total Medicines', value: stats.totalMedicines, icon: Pill, change: `${stats.lowStockCount} low`, up: false, color: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/25' },
          { title: 'Total Customers', value: stats.totalCustomers, icon: Users, change: '+23 new', up: true, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
        ].map((card, i) => (
          <Card key={i} className="border-0 shadow-lg overflow-hidden relative group hover:shadow-xl transition-shadow">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-bl-full`} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {card.up ? <ArrowUpRight className="h-3 w-3 text-emerald-600" /> : <ArrowDownRight className="h-3 w-3 text-amber-600" />}
                    <span className={`text-xs font-medium ${card.up ? 'text-emerald-600' : 'text-amber-600'}`}>{card.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg ${card.shadow}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Sales', value: stats.totalSales, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
          { label: 'Online Orders', value: stats.totalOrders, icon: Truck, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' },
          { label: 'Branches', value: stats.totalBranches, icon: Building2, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/30' },
          { label: 'Employees', value: stats.totalEmployees, icon: UserCheck, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' },
          { label: 'Low Stock', value: stats.lowStockCount, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
          { label: 'Expiring Soon', value: stats.expiringCount, icon: Clock, color: 'text-red-600 bg-red-50 dark:bg-red-900/30' },
        ].map((item, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <div className={`inline-flex p-2 rounded-lg ${item.color} mb-2`}>
                <item.icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold">{item.value}</p>
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Sales Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64">
              <AreaChart data={dailySales}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#salesGrad)" strokeWidth={2} name="Revenue (AFN)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Selling Medicines */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Selling Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64">
              <BarChart data={topSellingMedicines} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="totalRevenue" fill="#10b981" radius={[0, 4, 4, 0]} name="Revenue (AFN)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64">
              <PieChart>
                <Pie data={categoryStats} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {categoryStats.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {categoryStats.slice(0, 6).map((cat: any, i: number) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-muted-foreground">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Sales</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-emerald-600">
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentSales.slice(0, 8).map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Receipt className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{sale.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{sale.customer?.name || 'Walk-in'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(sale.totalAmount)}</p>
                    <Badge className={`text-[10px] h-5 ${getStatusColor(sale.paymentStatus)}`}>{sale.paymentStatus}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock & Expiry Alerts */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Alerts & Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {lowStockItems.slice(0, 5).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{item.medicine.name}</p>
                      <p className="text-[10px] text-muted-foreground">Only {item.quantity} left (min: {item.medicine.minStock})</p>
                    </div>
                  </div>
                  <Badge className="text-[10px] bg-amber-100 text-amber-700">Low Stock</Badge>
                </div>
              ))}
              {expiringSoon.slice(0, 5).map((item: any, i: number) => (
                <div key={`exp-${i}`} className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{item.medicine.name}</p>
                      <p className="text-[10px] text-muted-foreground">Expires: {formatDate(item.expiryDate)}</p>
                    </div>
                  </div>
                  <Badge className="text-[10px] bg-red-100 text-red-700">Expiring</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(activities || []).map((act: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Activity className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{act.user?.name || 'System'}</p>
                    <p className="text-[11px] text-muted-foreground">{act.details || act.action}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatDateTime(act.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================
// MEDICINES PAGE
// ============================================================

function MedicinesPage() {
  const [medicines, setMedicines] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [showAddDialog, setShowAddDialog] = useState(false)

  const fetchMedicines = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', search, categoryId: selectedCategory })
      const data = await apiFetch(`/medicines?${params}`)
      setMedicines(data.medicines)
      setPagination(data.pagination)
    } catch { toast.error('Failed to fetch medicines') }
    finally { setLoading(false) }
  }, [search, selectedCategory])

  useEffect(() => { apiFetch('/categories').then(setCategories).catch(() => {}) }, [])
  useEffect(() => { fetchMedicines(1) }, [fetchMedicines])

  const [newMed, setNewMed] = useState({ name: '', genericName: '', brandName: '', sku: '', categoryId: '', dosageForm: '', strength: '', unit: 'box', price: '', costPrice: '', taxRate: '0', prescriptionRequired: false, minStock: '10', maxStock: '1000' })

  const handleAddMedicine = async () => {
    try {
      await apiFetch('/medicines', {
        method: 'POST',
        body: JSON.stringify({
          ...newMed,
          slug: newMed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          price: parseFloat(newMed.price),
          costPrice: parseFloat(newMed.costPrice),
          taxRate: parseFloat(newMed.taxRate),
          minStock: parseInt(newMed.minStock),
          maxStock: parseInt(newMed.maxStock),
          supplierId: null,
        }),
      })
      toast.success('Medicine added successfully')
      setShowAddDialog(false)
      fetchMedicines()
    } catch { toast.error('Failed to add medicine') }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <Plus className="h-4 w-4 mr-2" /> Add Medicine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Medicine</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Name</Label><Input value={newMed.name} onChange={e => setNewMed({ ...newMed, name: e.target.value })} /></div>
              <div><Label>Generic Name</Label><Input value={newMed.genericName} onChange={e => setNewMed({ ...newMed, genericName: e.target.value })} /></div>
              <div><Label>Brand Name</Label><Input value={newMed.brandName} onChange={e => setNewMed({ ...newMed, brandName: e.target.value })} /></div>
              <div><Label>SKU</Label><Input value={newMed.sku} onChange={e => setNewMed({ ...newMed, sku: e.target.value })} /></div>
              <div><Label>Category</Label>
                <Select value={newMed.categoryId} onValueChange={v => setNewMed({ ...newMed, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Dosage Form</Label><Input value={newMed.dosageForm} onChange={e => setNewMed({ ...newMed, dosageForm: e.target.value })} placeholder="tablet/capsule/syrup" /></div>
              <div><Label>Strength</Label><Input value={newMed.strength} onChange={e => setNewMed({ ...newMed, strength: e.target.value })} placeholder="500mg" /></div>
              <div><Label>Unit</Label><Input value={newMed.unit} onChange={e => setNewMed({ ...newMed, unit: e.target.value })} /></div>
              <div><Label>Selling Price (AFN)</Label><Input type="number" value={newMed.price} onChange={e => setNewMed({ ...newMed, price: e.target.value })} /></div>
              <div><Label>Cost Price (AFN)</Label><Input type="number" value={newMed.costPrice} onChange={e => setNewMed({ ...newMed, costPrice: e.target.value })} /></div>
              <div><Label>Tax Rate (%)</Label><Input type="number" value={newMed.taxRate} onChange={e => setNewMed({ ...newMed, taxRate: e.target.value })} /></div>
              <div><Label>Min Stock</Label><Input type="number" value={newMed.minStock} onChange={e => setNewMed({ ...newMed, minStock: e.target.value })} /></div>
              <div><Label>Max Stock</Label><Input type="number" value={newMed.maxStock} onChange={e => setNewMed({ ...newMed, maxStock: e.target.value })} /></div>
              <div className="col-span-2 flex items-center gap-2"><Switch checked={newMed.prescriptionRequired} onCheckedChange={v => setNewMed({ ...newMed, prescriptionRequired: v })} /><Label>Prescription Required</Label></div>
            </div>
            <DialogFooter><Button onClick={handleAddMedicine} className="bg-emerald-600 hover:bg-emerald-700">Add Medicine</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Medicines Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicines.map((med: any) => (
            <Card key={med.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center text-lg">
                      {med.category?.icon || '💊'}
                    </div>
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{med.name}</p>
                      <p className="text-[11px] text-muted-foreground">{med.sku}</p>
                    </div>
                  </div>
                  {med.prescriptionRequired && <Badge className="text-[9px] h-5 bg-red-100 text-red-700"><Shield className="h-2.5 w-2.5 mr-0.5" />Rx</Badge>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div><span className="text-muted-foreground">Category:</span> <span className="font-medium">{med.category?.name}</span></div>
                  <div><span className="text-muted-foreground">Form:</span> <span className="font-medium">{med.dosageForm || '-'}</span></div>
                  <div><span className="text-muted-foreground">Strength:</span> <span className="font-medium">{med.strength || '-'}</span></div>
                  <div><span className="text-muted-foreground">Stock:</span> <span className={`font-bold ${med.totalStock <= med.minStock ? 'text-red-600' : 'text-emerald-600'}`}>{med.totalStock}</span></div>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(med.price)}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">/ {med.unit}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {med.avgRating > 0 && (
                      <div className="flex items-center gap-0.5 text-xs">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{med.avgRating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetchMedicines(pagination.page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
          <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchMedicines(pagination.page + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}

// ============================================================
// INVENTORY PAGE
// ============================================================

function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50', search, status: statusFilter })
      const data = await apiFetch(`/inventory?${params}`)
      setInventory(data.inventory)
    } catch { toast.error('Failed to fetch inventory') }
    finally { setLoading(false) }
  }, [search, statusFilter])

  useEffect(() => { fetchInventory() }, [fetchInventory])

  const statusCounts = inventory.reduce((acc, i) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc }, {} as Record<string, number>)

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Batches', value: inventory.length, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
          { label: 'In Stock', value: statusCounts.in_stock || 0, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
          { label: 'Low Stock', value: statusCounts.low_stock || 0, color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
          { label: 'Expired', value: statusCounts.expired || 0, color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className={`p-4 rounded-xl ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs opacity-80">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchInventory}><RefreshCcw className="h-4 w-4 mr-2" /> Refresh</Button>
      </div>

      {/* Inventory Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableHead className="text-xs font-semibold">Medicine</TableHead>
                  <TableHead className="text-xs font-semibold">Batch</TableHead>
                  <TableHead className="text-xs font-semibold">Quantity</TableHead>
                  <TableHead className="text-xs font-semibold">Cost</TableHead>
                  <TableHead className="text-xs font-semibold">Selling</TableHead>
                  <TableHead className="text-xs font-semibold">Expiry</TableHead>
                  <TableHead className="text-xs font-semibold">Location</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-8" /></TableCell></TableRow>
                  ))
                ) : inventory.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No inventory found</TableCell></TableRow>
                ) : (
                  inventory.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{item.medicine?.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.medicine?.sku}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{item.batchNumber}</TableCell>
                      <TableCell className="font-medium">{item.quantity}</TableCell>
                      <TableCell className="text-xs">{formatCurrency(item.costPrice)}</TableCell>
                      <TableCell className="text-xs">{formatCurrency(item.sellingPrice)}</TableCell>
                      <TableCell className="text-xs">{item.expiryDate ? formatDate(item.expiryDate) : '-'}</TableCell>
                      <TableCell className="text-xs font-mono">{item.location || '-'}</TableCell>
                      <TableCell><Badge className={`text-[10px] ${getStatusColor(item.status)}`}>{item.status.replace('_', ' ')}</Badge></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// SALES & POS PAGE
// ============================================================

function SalesPage() {
  const { posCart, addToPosCart, removeFromPosCart, updatePosCartQty, clearPosCart, user } = useStore()
  const [sales, setSales] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showPOS, setShowPOS] = useState(true)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  useEffect(() => {
    apiFetch('/medicines?limit=50').then(d => setMedicines(d.medicines)).catch(() => {})
    apiFetch('/sales?limit=20').then(d => { setSales(d.sales); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (customerSearch.length >= 2) {
      apiFetch(`/customers?search=${customerSearch}&limit=5`).then(d => setCustomers(d.customers)).catch(() => {})
    }
  }, [customerSearch])

  const posSubtotal = posCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const posTax = posCart.reduce((sum, item) => sum + item.price * item.quantity * item.taxRate / 100, 0)
  const posDiscount = posCart.reduce((sum, item) => sum + item.price * item.quantity * item.discount / 100, 0)
  const posTotal = posSubtotal + posTax - posDiscount

  const handleCheckout = async () => {
    if (posCart.length === 0) return toast.error('Cart is empty')
    try {
      await apiFetch('/sales', {
        method: 'POST',
        body: JSON.stringify({
          cashierId: user?.id,
          branchId: user?.branch?.id,
          customerId: selectedCustomer || null,
          items: posCart.map(item => ({ medicineId: item.medicineId, quantity: item.quantity, discount: item.discount })),
          paymentMethod,
          paymentStatus: 'paid',
          saleType: 'pos',
          discountAmount: posDiscount,
        }),
      })
      toast.success('Sale completed successfully!')
      clearPosCart()
      setSelectedCustomer('')
      // Refresh sales
      apiFetch('/sales?limit=20').then(d => setSales(d.sales))
    } catch { toast.error('Checkout failed') }
  }

  const addMedToCart = (med: any) => {
    addToPosCart({
      medicineId: med.id,
      name: med.name,
      price: med.price,
      quantity: 1,
      discount: 0,
      taxRate: med.taxRate || 0,
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant={showPOS ? 'default' : 'outline'} className={showPOS ? 'bg-emerald-600' : ''} onClick={() => setShowPOS(true)}>
          <ShoppingCart className="h-4 w-4 mr-2" /> POS Terminal
        </Button>
        <Button variant={!showPOS ? 'default' : 'outline'} className={!showPOS ? 'bg-emerald-600' : ''} onClick={() => setShowPOS(false)}>
          <FileText className="h-4 w-4 mr-2" /> Sales History
        </Button>
      </div>

      {showPOS ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Medicine Search */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search medicines by name, SKU, barcode..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-12 text-base" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[calc(100vh-320px)] overflow-y-auto">
              {medicines.filter((m: any) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.sku?.toLowerCase().includes(search.toLowerCase())).slice(0, 20).map((med: any) => (
                <div key={med.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-900" onClick={() => addMedToCart(med)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-lg">{med.category?.icon || '💊'}</div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{med.name}</p>
                      <p className="text-xs text-muted-foreground">{med.sku} · {med.dosageForm}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{formatCurrency(med.price)}</p>
                    <p className="text-[10px] text-muted-foreground">Stock: {med.totalStock || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart */}
          <Card className="border-0 shadow-xl h-fit sticky top-20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Cart</span>
                <Badge variant="outline">{posCart.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Customer */}
              <div>
                <Label className="text-xs">Customer (Optional)</Label>
                <Input placeholder="Search customer..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="h-8 text-xs" />
                {customers.length > 0 && (
                  <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                    {customers.map((c: any) => (
                      <button key={c.id} className={`w-full text-left p-1.5 rounded text-xs hover:bg-emerald-50 dark:hover:bg-emerald-900/30 ${selectedCustomer === c.id ? 'bg-emerald-50 dark:bg-emerald-900/30 font-medium' : ''}`} onClick={() => { setSelectedCustomer(c.id); setCustomerSearch(c.name) }}>
                        {c.name} - {c.phone}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Cart Items */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {posCart.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-8">Cart is empty. Click medicine to add.</p>
                ) : posCart.map(item => (
                  <div key={item.medicineId} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatCurrency(item.price)} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updatePosCartQty(item.medicineId, Math.max(0, item.quantity - 1))}>-</Button>
                      <span className="text-xs w-6 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updatePosCartQty(item.medicineId, item.quantity + 1)}>+</Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeFromPosCart(item.medicineId)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Payment Method */}
              <div>
                <Label className="text-xs">Payment Method</Label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {[
                    { value: 'cash', icon: Banknote, label: 'Cash' },
                    { value: 'card', icon: CreditCard, label: 'Card' },
                    { value: 'mobile', icon: Smartphone, label: 'Mobile' },
                  ].map(pm => (
                    <button key={pm.value} className={`p-2 rounded-lg text-xs flex flex-col items-center gap-1 transition-colors ${paymentMethod === pm.value ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 border border-emerald-300' : 'bg-gray-100 dark:bg-gray-800 border border-transparent hover:border-gray-300'}`} onClick={() => setPaymentMethod(pm.value)}>
                      <pm.icon className="h-4 w-4" /> {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(posSubtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(posTax)}</span></div>
                {posDiscount > 0 && <div className="flex justify-between text-red-600"><span>Discount</span><span>-{formatCurrency(posDiscount)}</span></div>}
                <Separator />
                <div className="flex justify-between text-base font-bold"><span>Total</span><span className="text-emerald-600">{formatCurrency(posTotal)}</span></div>
              </div>

              <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 h-12 text-base" onClick={handleCheckout} disabled={posCart.length === 0}>
                <Receipt className="h-5 w-5 mr-2" /> Complete Sale
              </Button>
              <Button variant="outline" className="w-full" onClick={clearPosCart} disabled={posCart.length === 0}>Clear Cart</Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Sales History */
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead className="text-xs font-semibold">Invoice</TableHead>
                    <TableHead className="text-xs font-semibold">Customer</TableHead>
                    <TableHead className="text-xs font-semibold">Items</TableHead>
                    <TableHead className="text-xs font-semibold">Total</TableHead>
                    <TableHead className="text-xs font-semibold">Payment</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8" /></TableCell></TableRow>)
                  ) : sales.map((sale: any) => (
                    <TableRow key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <TableCell className="font-mono text-xs font-bold">{sale.invoiceNumber}</TableCell>
                      <TableCell className="text-xs">{sale.customer?.name || 'Walk-in'}</TableCell>
                      <TableCell className="text-xs">{sale.items?.length || 0} items</TableCell>
                      <TableCell className="font-bold text-emerald-600">{formatCurrency(sale.totalAmount)}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{sale.paymentMethod}</Badge></TableCell>
                      <TableCell><Badge className={`text-[10px] ${getStatusColor(sale.paymentStatus)}`}>{sale.paymentStatus}</Badge></TableCell>
                      <TableCell className="text-xs">{formatDateTime(sale.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================================
// CUSTOMERS PAGE
// ============================================================

function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newCust, setNewCust] = useState({ name: '', email: '', phone: '', address: '', city: '', gender: '' })

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch(`/customers?search=${search}&limit=20`)
      setCustomers(data.customers)
    } catch { toast.error('Failed to fetch customers') }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const handleAddCustomer = async () => {
    try {
      await apiFetch('/customers', { method: 'POST', body: JSON.stringify(newCust) })
      toast.success('Customer added')
      setShowAdd(false)
      setNewCust({ name: '', email: '', phone: '', address: '', city: '', gender: '' })
      fetchCustomers()
    } catch { toast.error('Failed to add customer') }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-2" /> Add Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={newCust.name} onChange={e => setNewCust({ ...newCust, name: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={newCust.phone} onChange={e => setNewCust({ ...newCust, phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={newCust.email} onChange={e => setNewCust({ ...newCust, email: e.target.value })} /></div>
              <div><Label>Address</Label><Input value={newCust.address} onChange={e => setNewCust({ ...newCust, address: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>City</Label><Input value={newCust.city} onChange={e => setNewCust({ ...newCust, city: e.target.value })} /></div>
                <div><Label>Gender</Label>
                  <Select value={newCust.gender} onValueChange={v => setNewCust({ ...newCust, gender: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={handleAddCustomer} className="bg-emerald-600">Add Customer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40 rounded-xl" />) :
          customers.map((c: any) => (
            <Card key={c.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-bold">{c.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.phone}</p>
                  </div>
                  <Badge className="text-[10px] bg-emerald-100 text-emerald-700">{c.loyaltyPoints} pts</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{c.email || '-'}</span></div>
                  <div><span className="text-muted-foreground">City:</span> <span className="font-medium">{c.city || '-'}</span></div>
                  <div><span className="text-muted-foreground">Total Spent:</span> <span className="font-bold text-emerald-600">{formatCurrency(c.totalSpent)}</span></div>
                  <div><span className="text-muted-foreground">Orders:</span> <span className="font-medium">{c.totalOrders}</span></div>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Joined: {formatDate(c.createdAt)}</span>
                  <span>{c._count?.sales || 0} sales</span>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  )
}

// ============================================================
// EMPLOYEES PAGE
// ============================================================

function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/employees?limit=20').then(d => { setEmployees(d.employees); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const roleColors: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-700',
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    pharmacist: 'bg-emerald-100 text-emerald-700',
    cashier: 'bg-amber-100 text-amber-700',
    staff: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />) :
          employees.map((emp: any) => (
            <Card key={emp.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold">{emp.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{emp.name}</p>
                    <Badge className={`text-[10px] ${roleColors[emp.role] || 'bg-gray-100'}`}>{emp.role.replace('_', ' ')}</Badge>
                  </div>
                  {emp.isActive ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-500" />}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-muted-foreground" />{emp.email}</div>
                  <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-muted-foreground" />{emp.phone}</div>
                  <div className="flex items-center gap-2"><Building2 className="h-3 w-3 text-muted-foreground" />{emp.branch?.name || 'No branch'}</div>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  )
}

// ============================================================
// ORDERS PAGE
// ============================================================

function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch(`/orders?status=${statusFilter}&limit=50`)
      setOrders(data.orders)
    } catch { toast.error('Failed to fetch orders') }
    finally { setLoading(false) }
  }, [statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await apiFetch('/orders', { method: 'PUT', body: JSON.stringify({ id, status }) })
      toast.success('Order status updated')
      fetchOrders()
    } catch { toast.error('Failed to update order') }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className={statusFilter === s ? 'bg-emerald-600' : ''} onClick={() => setStatusFilter(s)}>
            {s || 'All'} {s && <Badge className="ml-1 h-4 text-[9px]">{orders.filter(o => o.status === s).length}</Badge>}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? [1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />) :
          orders.map((order: any) => (
            <Card key={order.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.customer?.name} · {order.customer?.phone}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.shippingAddress}, {order.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <Badge className={`text-[10px] ${getStatusColor(order.status)}`}>{order.status}</Badge>
                    <Select onValueChange={v => updateOrderStatus(order.id, v)}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Update" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  )
}

// ============================================================
// PRESCRIPTIONS PAGE
// ============================================================

function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/prescriptions?limit=20').then(d => { setPrescriptions(d.prescriptions); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-xl" />) :
          prescriptions.length === 0 ? (
            <Card className="col-span-2 border-0 shadow-md"><CardContent className="py-12 text-center text-muted-foreground">
              <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No prescriptions found</p>
            </CardContent></Card>
          ) :
          prescriptions.map((rx: any) => (
            <Card key={rx.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm">{rx.prescriptionNumber}</p>
                    <p className="text-xs text-muted-foreground">{rx.customer?.name}</p>
                  </div>
                  <Badge className={`text-[10px] ${getStatusColor(rx.status)}`}>{rx.status}</Badge>
                </div>
                <div className="space-y-1 text-xs mb-3">
                  <div className="flex items-center gap-2"><Stethoscope className="h-3 w-3 text-muted-foreground" /> Dr. {rx.doctorName}</div>
                  {rx.diagnosis && <div className="flex items-center gap-2"><ClipboardList className="h-3 w-3 text-muted-foreground" /> {rx.diagnosis}</div>}
                </div>
                {rx.items?.length > 0 && (
                  <div className="space-y-1">
                    {rx.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs">
                        <span className="font-medium">{item.medicine?.name}</span>
                        <span className="text-muted-foreground">{item.dosage} · {item.frequency} · {item.duration}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground mt-2">{formatDateTime(rx.createdAt)}</div>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  )
}

// ============================================================
// SUPPLIERS PAGE
// ============================================================

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/suppliers').then(setSuppliers).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? [1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />) :
          suppliers.map((s: any) => (
            <Card key={s.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <Badge variant="outline" className="text-[10px]">{s.code}</Badge>
                  </div>
                  <Badge className="text-[10px] bg-emerald-100 text-emerald-700">{s._count?.medicines || 0} medicines</Badge>
                </div>
                <div className="space-y-1 text-xs">
                  {s.contactPerson && <div className="flex items-center gap-2"><Users className="h-3 w-3 text-muted-foreground" />{s.contactPerson}</div>}
                  <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-muted-foreground" />{s.phone}</div>
                  {s.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-muted-foreground" />{s.email}</div>}
                  {s.city && <div className="flex items-center gap-2"><MapPin className="h-3 w-3 text-muted-foreground" />{s.city}</div>}
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Balance:</span>
                  <span className="font-bold">{formatCurrency(s.balance)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  )
}

// ============================================================
// EXPENSES PAGE
// ============================================================

function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/expenses?limit=50').then(d => { setExpenses(d.expenses); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const byCategory = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc }, {} as Record<string, number>)

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm col-span-2 sm:col-span-1">
          <CardContent className="p-4 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl">
            <p className="text-xs opacity-80">Total Expenses</p>
            <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
        {Object.entries(byCategory).slice(0, 3).map(([cat, amt], i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground capitalize">{cat}</p>
              <p className="text-lg font-bold">{formatCurrency(amt)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-gray-50 dark:bg-gray-800/50">
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs">Amount</TableHead>
              <TableHead className="text-xs">Description</TableHead>
              <TableHead className="text-xs">Branch</TableHead>
              <TableHead className="text-xs">Date</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loading ? [1, 2, 3].map(i => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8" /></TableCell></TableRow>) :
                expenses.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell><Badge variant="outline" className="text-[10px] capitalize">{e.category}</Badge></TableCell>
                    <TableCell className="font-bold text-red-600">{formatCurrency(e.amount)}</TableCell>
                    <TableCell className="text-xs">{e.description || '-'}</TableCell>
                    <TableCell className="text-xs">{e.branch?.name || '-'}</TableCell>
                    <TableCell className="text-xs">{formatDate(e.date)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// REPORTS PAGE
// ============================================================

function ReportsPage() {
  const [reportType, setReportType] = useState('revenue')
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentType, setCurrentType] = useState('revenue')

  const handleReportTypeChange = async (type: string) => {
    setCurrentType(type)
    try {
      const d = await apiFetch(`/reports?type=${type}`)
      setReportData(d)
      setLoading(false)
    } catch { toast.error('Failed to load report'); setLoading(false) }
  }

  useEffect(() => {
    let cancelled = false
    apiFetch(`/reports?type=${currentType}`).then(d => {
      if (!cancelled) { setReportData(d); setLoading(false) }
    }).catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [currentType])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'revenue', label: 'Revenue', icon: DollarSign },
          { value: 'inventory', label: 'Inventory', icon: Package },
        ].map(r => (
          <Button key={r.value} variant={reportType === r.value ? 'default' : 'outline'} className={reportType === r.value ? 'bg-emerald-600' : ''} onClick={() => { setReportType(r.value); handleReportTypeChange(r.value) }}>
            <r.icon className="h-4 w-4 mr-2" /> {r.label}
          </Button>
        ))}
      </div>

      {loading ? <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div> :

        reportType === 'revenue' && reportData ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Revenue', value: formatCurrency(reportData.totalRevenue), color: 'from-emerald-500 to-teal-600' },
                { label: 'Gross Profit', value: formatCurrency(reportData.grossProfit), color: 'from-blue-500 to-cyan-600' },
                { label: 'Total Cost', value: formatCurrency(reportData.totalCost), color: 'from-amber-500 to-orange-600' },
                { label: 'Margin', value: `${reportData.grossMargin}%`, color: 'from-purple-500 to-violet-600' },
              ].map((card, i) => (
                <Card key={i} className="border-0 shadow-md overflow-hidden">
                  <CardContent className={`p-4 bg-gradient-to-br ${card.color} text-white rounded-xl`}>
                    <p className="text-xs opacity-80">{card.label}</p>
                    <p className="text-xl font-bold">{card.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {reportData.dailyBreakdown?.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2"><CardTitle className="text-base">Daily Revenue Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-64">
                    <BarChart data={reportData.dailyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                      <Bar dataKey="cost" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Cost" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </>
        ) : reportType === 'inventory' && reportData ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Batches', value: reportData.totalBatches },
                { label: 'Total Items', value: reportData.totalItems },
                { label: 'Total Value', value: formatCurrency(reportData.totalValue) },
                { label: 'Total Cost', value: formatCurrency(reportData.totalCost) },
              ].map((card, i) => (
                <Card key={i} className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-xl font-bold">{card.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {reportData.byCategory?.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2"><CardTitle className="text-base">Inventory by Category</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-64">
                    <BarChart data={reportData.byCategory}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="Value (AFN)" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </>
        ) : null
      }
    </div>
  )
}

// ============================================================
// NOTIFICATIONS PAGE
// ============================================================

function NotificationsPage() {
  const { user } = useStore()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      apiFetch(`/notifications?userId=${user.id}`).then(d => { setNotifications(d.notifications); setLoading(false) }).catch(() => setLoading(false))
    }
  }, [user?.id])

  const markAllRead = async () => {
    try {
      await apiFetch('/notifications', { method: 'PUT', body: JSON.stringify({ markAllRead: true, userId: user?.id }) })
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch { toast.error('Failed to mark as read') }
  }

  const typeIcons: Record<string, any> = { warning: AlertTriangle, error: X, success: CheckCircle, info: Info, alert: Bell }
  const typeColors: Record<string, string> = { warning: 'bg-amber-100 text-amber-600', error: 'bg-red-100 text-red-600', success: 'bg-emerald-100 text-emerald-600', info: 'bg-blue-100 text-blue-600', alert: 'bg-purple-100 text-purple-600' }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{notifications.filter(n => !n.isRead).length} unread notifications</p>
        <Button variant="outline" size="sm" onClick={markAllRead}><CheckCircle className="h-4 w-4 mr-1" /> Mark All Read</Button>
      </div>
      <div className="space-y-2">
        {loading ? [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />) :
          notifications.map(n => {
            const Icon = typeIcons[n.type] || Bell
            return (
              <Card key={n.id} className={`border-0 shadow-sm ${!n.isRead ? 'border-l-4 border-l-emerald-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${typeColors[n.type] || 'bg-gray-100'}`}><Icon className="h-4 w-4" /></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />}
                  </div>
                </CardContent>
              </Card>
            )
          })
        }
      </div>
    </div>
  )
}

// ============================================================
// BRANCHES PAGE
// ============================================================

function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([])

  useEffect(() => {
    apiFetch('/dashboard').then(data => {
      // We'll use the data from dashboard for branches
    }).catch(() => {})
  }, [])

  const branchData = [
    { name: 'Zargoon Main Branch', code: 'ZG-001', address: 'Karta-e-Mamorin, Kabul', phone: '+93-700-123456', email: 'main@zargoon.com', status: 'Active' },
    { name: 'Zargoon City Center', code: 'ZG-002', address: 'Kabul City Center', phone: '+93-700-234567', email: 'city@zargoon.com', status: 'Active' },
    { name: 'Zargoon Herat Branch', code: 'ZG-003', address: 'Herat Main Road', phone: '+93-700-345678', email: 'herat@zargoon.com', status: 'Active' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branchData.map((b, i) => (
          <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold">{b.name}</h3>
                  <Badge variant="outline" className="text-[10px] mt-1">{b.code}</Badge>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">{b.status}</Badge>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{b.address}</div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{b.phone}</div>
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{b.email}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// SETTINGS PAGE
// ============================================================

function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/settings').then(setSettings).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    try {
      await apiFetch('/settings', { method: 'PUT', body: JSON.stringify(settings) })
      toast.success('Settings saved successfully')
    } catch { toast.error('Failed to save settings') }
  }

  if (loading) return <div className="p-6"><Skeleton className="h-96 rounded-xl" /></div>

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      {/* Pharmacy Info */}
      <Card className="border-0 shadow-lg">
        <CardHeader><CardTitle className="text-base">Pharmacy Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Pharmacy Name</Label><Input value={settings.pharmacy_name || ''} onChange={e => setSettings({ ...settings, pharmacy_name: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={settings.pharmacy_phone || ''} onChange={e => setSettings({ ...settings, pharmacy_phone: e.target.value })} /></div>
          <div><Label>Address</Label><Input value={settings.pharmacy_address || ''} onChange={e => setSettings({ ...settings, pharmacy_address: e.target.value })} /></div>
          <div><Label>Currency</Label>
            <Select value={settings.currency || 'AFN'} onValueChange={v => setSettings({ ...settings, currency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="AFN">AFN - Afghani</SelectItem><SelectItem value="USD">USD - Dollar</SelectItem></SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Billing Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader><CardTitle className="text-base">Billing Settings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between"><Label>Tax Enabled</Label><Switch checked={settings.tax_enabled === 'true'} onCheckedChange={v => setSettings({ ...settings, tax_enabled: String(v) })} /></div>
          <div><Label>Default Tax Rate (%)</Label><Input type="number" value={settings.default_tax_rate || '0'} onChange={e => setSettings({ ...settings, default_tax_rate: e.target.value })} /></div>
          <div><Label>Loyalty Points Rate</Label><Input type="number" value={settings.loyalty_points_rate || '1'} onChange={e => setSettings({ ...settings, loyalty_points_rate: e.target.value })} /></div>
          <div><Label>Delivery Fee (AFN)</Label><Input type="number" value={settings.delivery_fee || '50'} onChange={e => setSettings({ ...settings, delivery_fee: e.target.value })} /></div>
        </CardContent>
      </Card>

      {/* Inventory Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader><CardTitle className="text-base">Inventory Settings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Low Stock Threshold</Label><Input type="number" value={settings.low_stock_threshold || '10'} onChange={e => setSettings({ ...settings, low_stock_threshold: e.target.value })} /></div>
          <div><Label>Expiry Alert (Days)</Label><Input type="number" value={settings.expiry_alert_days || '30'} onChange={e => setSettings({ ...settings, expiry_alert_days: e.target.value })} /></div>
        </CardContent>
      </Card>

      {/* Developer Info */}
      <Card className="border-0 shadow-lg">
        <CardHeader><CardTitle className="text-base">Developer Information</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Asadullah Hameedi</p>
            <p className="text-muted-foreground">Kabul, Afghanistan</p>
            <div className="flex gap-4 mt-2">
              <a href="https://github.com/asadullahhameeedi/" target="_blank" className="text-emerald-600 hover:underline flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> GitHub</a>
              <a href="https://www.linkedin.com/in/as" target="_blank" className="text-emerald-600 hover:underline flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> LinkedIn</a>
              <a href="mailto:asadullah.hameedi512@gmail.com" className="text-emerald-600 hover:underline flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email</a>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg w-full">
        <Download className="h-4 w-4 mr-2" /> Save Settings
      </Button>
    </div>
  )
}

// ============================================================
// ONLINE PHARMACY STORE
// ============================================================

function OnlineStore() {
  const { cart, addToCart, removeFromCart, updateCartQty, clearCart, setViewMode, storeView, setStoreView } = useStore()
  const [medicines, setMedicines] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [promotions, setPromotions] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      apiFetch('/medicines?limit=50'),
      apiFetch('/categories'),
      apiFetch('/promotions'),
    ]).then(([medData, catData, promoData]) => {
      setMedicines(medData.medicines)
      setCategories(catData)
      setPromotions(promoData)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const filteredMedicines = medicines.filter((m: any) => {
    const matchesSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.genericName?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || m.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredMeds = medicines.filter((m: any) => m.avgRating >= 4 || m.totalStock > 100).slice(0, 8)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Store Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setViewMode('login')}><ArrowUpRight className="h-4 w-4" /></Button>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">ZG</div>
                <div><h1 className="font-bold text-sm">Zargoon Pharmacy</h1><p className="text-[10px] text-muted-foreground">Your trusted online pharmacy</p></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64 h-9" />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {cartCount > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-emerald-600">{cartCount}</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader><SheetTitle>Shopping Cart ({cartCount})</SheetTitle></SheetHeader>
                  <div className="mt-4 space-y-3">
                    {cart.length === 0 ? <p className="text-center text-sm text-muted-foreground py-12">Your cart is empty</p> :
                      cart.map(item => (
                        <div key={item.medicineId} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateCartQty(item.medicineId, Math.max(1, item.quantity - 1))}>-</Button>
                            <span className="w-6 text-center text-xs">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateCartQty(item.medicineId, item.quantity + 1)}>+</Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeFromCart(item.medicineId)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      ))
                    }
                    {cart.length > 0 && (
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-bold">{formatCurrency(cartTotal)}</span></div>
                        <div className="flex justify-between text-sm"><span>Delivery</span><span>AFN 50</span></div>
                        <Separator />
                        <div className="flex justify-between font-bold"><span>Total</span><span className="text-emerald-600">{formatCurrency(cartTotal + 50)}</span></div>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => toast.success('Order placed successfully!')}>Checkout</Button>
                        <Button variant="outline" className="w-full" onClick={clearCart}>Clear Cart</Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section */}
        {storeView === 'home' && !search && !selectedCategory && (
          <div className="mb-8">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 md:p-12 text-white mb-6">
              <div className="relative z-10">
                <Badge className="bg-white/20 text-white border-0 mb-3">Trusted by 10,000+ customers</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Your Health, Our Priority</h2>
                <p className="text-emerald-100 mb-6 max-w-lg">Order medicines online with fast delivery across Afghanistan. Verified prescriptions, authentic medicines, and expert pharmacist support.</p>
                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300" />
                    <Input placeholder="Search for medicines..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-12 bg-white/10 border-white/20 text-white placeholder:text-emerald-200 backdrop-blur-sm" />
                  </div>
                  <Button className="bg-white text-emerald-700 hover:bg-emerald-50 h-12 font-bold shadow-lg">Shop Now</Button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
                <div className="absolute top-10 right-10 w-32 h-32 rounded-full border-4 border-white" />
                <div className="absolute bottom-10 right-20 w-24 h-24 rounded-full border-4 border-white" />
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Truck, title: 'Fast Delivery', desc: 'Same day in Kabul' },
                { icon: Shield, title: 'Authentic', desc: '100% genuine meds' },
                { icon: Stethoscope, title: 'Expert Support', desc: 'Licensed pharmacists' },
                { icon: CreditCard, title: 'Easy Payment', desc: 'Cash, Card, Mobile' },
              ].map((f, i) => (
                <Card key={i} className="border-0 shadow-sm text-center p-4">
                  <f.icon className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </Card>
              ))}
            </div>

            {/* Promotions */}
            {promotions.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold text-lg mb-3">Special Offers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {promotions.map((promo: any) => (
                    <Card key={promo.id} className="border-0 shadow-md overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
                        <Badge className="bg-white/20 text-white border-0 text-[10px]">{promo.type === 'percentage' ? `${promo.value}% OFF` : promo.type === 'fixed' ? `${formatCurrency(promo.value)} OFF` : 'BOGO'}</Badge>
                        <p className="font-bold mt-2">{promo.title}</p>
                        <p className="text-xs opacity-80 mt-1">{promo.description}</p>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{promo.code}</code>
                          <span className="text-[10px] text-muted-foreground">Min: {formatCurrency(promo.minOrder)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Categories */}
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button variant={!selectedCategory ? 'default' : 'outline'} size="sm" className={!selectedCategory ? 'bg-emerald-600 shrink-0' : 'shrink-0'} onClick={() => setSelectedCategory('')}>All</Button>
            {categories.map((cat: any) => (
              <Button key={cat.id} variant={selectedCategory === cat.id ? 'default' : 'outline'} size="sm" className={`shrink-0 ${selectedCategory === cat.id ? 'bg-emerald-600' : ''}`} onClick={() => setSelectedCategory(cat.id)}>
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-4">
          <h3 className="font-bold text-lg">{search ? `Results for "${search}"` : selectedCategory ? categories.find((c: any) => c.id === selectedCategory)?.name || 'Products' : 'Featured Medicines'}</h3>
          <p className="text-sm text-muted-foreground">{filteredMedicines.length} products found</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-56 rounded-xl" />)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(selectedCategory || search ? filteredMedicines : featuredMeds).map((med: any) => (
              <Card key={med.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => { setSelectedMedicine(med); setStoreView('detail') }}>
                <CardContent className="p-4">
                  <div className="w-full h-24 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center text-3xl mb-3 group-hover:scale-105 transition-transform">
                    {med.category?.icon || '💊'}
                  </div>
                  <div>
                    <p className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{med.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{med.strength || med.dosageForm || ''}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {med.avgRating > 0 && Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className={`h-3 w-3 ${si < Math.round(med.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      ))}
                      {med.avgRating > 0 && <span className="text-[10px] text-muted-foreground ml-1">({med.reviewCount})</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(med.price)}</span>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8" onClick={(e) => { e.stopPropagation(); addToCart({ medicineId: med.id, name: med.name, price: med.price, quantity: 1, prescriptionRequired: med.prescriptionRequired }) }}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {med.prescriptionRequired && <Badge className="w-full mt-2 text-[9px] bg-red-50 text-red-600 justify-center"><Shield className="h-2.5 w-2.5 mr-1" /> Prescription Required</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t pt-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs">ZG</div>
                <span className="font-bold">Zargoon Pharmacy</span>
              </div>
              <p className="text-xs text-muted-foreground">Your trusted online pharmacy in Afghanistan. Quality medicines delivered to your door.</p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-2">Quick Links</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="hover:text-emerald-600 cursor-pointer">About Us</p>
                <p className="hover:text-emerald-600 cursor-pointer">Delivery Info</p>
                <p className="hover:text-emerald-600 cursor-pointer">Return Policy</p>
                <p className="hover:text-emerald-600 cursor-pointer">Terms & Conditions</p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-2">Categories</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                {categories.slice(0, 5).map((c: any) => <p key={c.id} className="hover:text-emerald-600 cursor-pointer">{c.name}</p>)}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-2">Contact</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />Kabul, Afghanistan</p>
                <p className="flex items-center gap-1"><Phone className="h-3 w-3" />+93-700-123456</p>
                <p className="flex items-center gap-1"><Mail className="h-3 w-3" />info@zargoon.com</p>
              </div>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>&copy; 2024 Zargoon Pharmacy. All rights reserved.</p>
            <p>Developed by <span className="font-medium text-emerald-600">Asadullah Hameedi</span></p>
          </div>
        </footer>
      </main>
    </div>
  )
}

// ============================================================
// ADMIN LAYOUT
// ============================================================

function AdminLayout() {
  const { adminTab, darkMode } = useStore()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const renderPage = () => {
    switch (adminTab) {
      case 'dashboard': return <DashboardPage />
      case 'medicines': return <MedicinesPage />
      case 'inventory': return <InventoryPage />
      case 'sales': return <SalesPage />
      case 'customers': return <CustomersPage />
      case 'employees': return <EmployeesPage />
      case 'orders': return <OrdersPage />
      case 'prescriptions': return <PrescriptionsPage />
      case 'suppliers': return <SuppliersPage />
      case 'expenses': return <ExpensesPage />
      case 'reports': return <ReportsPage />
      case 'notifications': return <NotificationsPage />
      case 'branches': return <BranchesPage />
      case 'settings': return <SettingsPage />
      default: return <DashboardPage />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <div className="lg:pl-72">
        <AdminHeader />
        <main>{renderPage()}</main>
      </div>
    </div>
  )
}

// ============================================================
// MAIN APP
// ============================================================

export default function PharmacyApp() {
  const { viewMode } = useStore()

  // Auto-seed on first load
  useEffect(() => {
    fetch('/api/auth/seed', { method: 'POST' }).then(r => r.json()).then(data => {
      if (data.seeded) console.log('Database seeded successfully')
    }).catch(() => {})
  }, [])

  return (
    <>
      {viewMode === 'login' && <LoginPage />}
      {viewMode === 'admin' && <AdminLayout />}
      {viewMode === 'store' && <OnlineStore />}
    </>
  )
}
