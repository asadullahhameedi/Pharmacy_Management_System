import { create } from 'zustand'

export type ViewMode = 'login' | 'admin' | 'store'
export type AdminTab = 'dashboard' | 'inventory' | 'medicines' | 'sales' | 'customers' | 'employees' | 'orders' | 'prescriptions' | 'reports' | 'suppliers' | 'expenses' | 'settings' | 'notifications' | 'branches'

interface User {
  id: string
  email: string
  name: string
  role: string
  phone?: string
  avatar?: string
  branch?: { id: string; name: string; code: string } | null
}

interface CartItem {
  medicineId: string
  name: string
  price: number
  quantity: number
  image?: string
  prescriptionRequired: boolean
}

interface StoreState {
  // Auth
  user: User | null
  token: string | null
  isAuthenticated: boolean
  viewMode: ViewMode
  setAuth: (user: User, token: string) => void
  logout: () => void
  setViewMode: (mode: ViewMode) => void

  // Admin navigation
  adminTab: AdminTab
  setAdminTab: (tab: AdminTab) => void

  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // Cart (online store)
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (medicineId: string) => void
  updateCartQty: (medicineId: string, qty: number) => void
  clearCart: () => void

  // Store navigation
  storeView: string
  setStoreView: (view: string) => void

  // POS Cart
  posCart: { medicineId: string; name: string; price: number; quantity: number; discount: number; taxRate: number }[]
  addToPosCart: (item: { medicineId: string; name: string; price: number; quantity: number; discount: number; taxRate: number }) => void
  removeFromPosCart: (medicineId: string) => void
  updatePosCartQty: (medicineId: string, qty: number) => void
  clearPosCart: () => void

  // Theme
  darkMode: boolean
  toggleDarkMode: () => void

  // Loading
  loading: boolean
  setLoading: (loading: boolean) => void
}

export const useStore = create<StoreState>((set, get) => ({
  // Auth
  user: null,
  token: null,
  isAuthenticated: false,
  viewMode: 'login',
  setAuth: (user, token) => set({ user, token, isAuthenticated: true, viewMode: 'admin' }),
  logout: () => set({ user: null, token: null, isAuthenticated: false, viewMode: 'login', adminTab: 'dashboard', cart: [], posCart: [] }),
  setViewMode: (mode) => set({ viewMode: mode }),

  // Admin navigation
  adminTab: 'dashboard',
  setAdminTab: (tab) => set({ adminTab: tab }),

  // Sidebar
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Cart (online store)
  cart: [],
  addToCart: (item) => {
    const cart = get().cart
    const existing = cart.find(c => c.medicineId === item.medicineId)
    if (existing) {
      set({ cart: cart.map(c => c.medicineId === item.medicineId ? { ...c, quantity: c.quantity + 1 } : c) })
    } else {
      set({ cart: [...cart, item] })
    }
  },
  removeFromCart: (medicineId) => set({ cart: get().cart.filter(c => c.medicineId !== medicineId) }),
  updateCartQty: (medicineId, qty) => set({ cart: get().cart.map(c => c.medicineId === medicineId ? { ...c, quantity: qty } : c) }),
  clearCart: () => set({ cart: [] }),

  // Store navigation
  storeView: 'home',
  setStoreView: (view) => set({ storeView: view }),

  // POS Cart
  posCart: [],
  addToPosCart: (item) => {
    const cart = get().posCart
    const existing = cart.find(c => c.medicineId === item.medicineId)
    if (existing) {
      set({ posCart: cart.map(c => c.medicineId === item.medicineId ? { ...c, quantity: c.quantity + item.quantity } : c) })
    } else {
      set({ posCart: [...cart, item] })
    }
  },
  removeFromPosCart: (medicineId) => set({ posCart: get().posCart.filter(c => c.medicineId !== medicineId) }),
  updatePosCartQty: (medicineId, qty) => set({ posCart: get().posCart.map(c => c.medicineId === medicineId ? { ...c, quantity: qty } : c) }),
  clearPosCart: () => set({ posCart: [] }),

  // Theme
  darkMode: false,
  toggleDarkMode: () => set({ darkMode: !get().darkMode }),

  // Loading
  loading: false,
  setLoading: (loading) => set({ loading }),
}))
