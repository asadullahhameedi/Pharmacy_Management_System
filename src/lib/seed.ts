import { db } from './db'
import { hashPassword } from './auth'

export async function seedDatabase() {
  // Check if already seeded
  const userCount = await db.user.count()
  if (userCount > 0) return { seeded: false, message: 'Database already seeded' }

  // Create Branches
  const mainBranch = await db.branch.create({
    data: { name: 'Zargoon Main Branch', code: 'ZG-001', address: 'Karta-e-Mamorin, Kabul', city: 'Kabul', phone: '+93-700-123456', email: 'main@zargoon.com' }
  })
  const branch2 = await db.branch.create({
    data: { name: 'Zargoon City Center', code: 'ZG-002', address: 'Kabul City Center', city: 'Kabul', phone: '+93-700-234567', email: 'city@zargoon.com' }
  })
  const branch3 = await db.branch.create({
    data: { name: 'Zargoon Herat Branch', code: 'ZG-003', address: 'Herat Main Road', city: 'Herat', phone: '+93-700-345678', email: 'herat@zargoon.com' }
  })

  // Create Warehouses
  const wh1 = await db.warehouse.create({ data: { name: 'Main Warehouse', code: 'WH-001', branchId: mainBranch.id, address: 'Industrial Area, Kabul', capacity: 50000 } })
  const wh2 = await db.warehouse.create({ data: { name: 'City Center Warehouse', code: 'WH-002', branchId: branch2.id, address: 'City Center Storage', capacity: 20000 } })

  // Create Users
  const adminPassword = await hashPassword('admin123')
  const users = await Promise.all([
    db.user.create({ data: { email: 'admin@zargoon.com', password: adminPassword, name: 'Asadullah Hameedi', phone: '+93-700-100001', role: 'super_admin', branchId: mainBranch.id, avatar: null } }),
    db.user.create({ data: { email: 'manager@zargoon.com', password: adminPassword, name: 'Ahmad Rahimi', phone: '+93-700-100002', role: 'manager', branchId: mainBranch.id } }),
    db.user.create({ data: { email: 'pharmacist@zargoon.com', password: adminPassword, name: 'Fatima Noori', phone: '+93-700-100003', role: 'pharmacist', branchId: mainBranch.id } }),
    db.user.create({ data: { email: 'cashier@zargoon.com', password: adminPassword, name: 'Mohammad Karimi', phone: '+93-700-100004', role: 'cashier', branchId: branch2.id } }),
    db.user.create({ data: { email: 'pharmacist2@zargoon.com', password: adminPassword, name: 'Sara Ahmadi', phone: '+93-700-100005', role: 'pharmacist', branchId: branch3.id } }),
    db.user.create({ data: { email: 'staff@zargoon.com', password: adminPassword, name: 'Ali Hassani', phone: '+93-700-100006', role: 'staff', branchId: mainBranch.id } }),
  ])

  // Create Categories
  const categories = await Promise.all([
    db.category.create({ data: { name: 'Pain Relief', slug: 'pain-relief', icon: '💊', color: '#ef4444' } }),
    db.category.create({ data: { name: 'Antibiotics', slug: 'antibiotics', icon: '🦠', color: '#3b82f6' } }),
    db.category.create({ data: { name: 'Vitamins & Supplements', slug: 'vitamins-supplements', icon: '🍊', color: '#f59e0b' } }),
    db.category.create({ data: { name: 'Cardiovascular', slug: 'cardiovascular', icon: '❤️', color: '#ec4899' } }),
    db.category.create({ data: { name: 'Diabetes', slug: 'diabetes', icon: '💉', color: '#8b5cf6' } }),
    db.category.create({ data: { name: 'Respiratory', slug: 'respiratory', icon: '🫁', color: '#06b6d4' } }),
    db.category.create({ data: { name: 'Dermatology', slug: 'dermatology', icon: '🧴', color: '#10b981' } }),
    db.category.create({ data: { name: 'Gastrointestinal', slug: 'gastrointestinal', icon: '🫃', color: '#f97316' } }),
    db.category.create({ data: { name: 'Eye Care', slug: 'eye-care', icon: '👁️', color: '#6366f1' } }),
    db.category.create({ data: { name: 'First Aid', slug: 'first-aid', icon: '🩹', color: '#dc2626' } }),
    db.category.create({ data: { name: 'Baby Care', slug: 'baby-care', icon: '👶', color: '#f472b6' } }),
    db.category.create({ data: { name: 'Personal Care', slug: 'personal-care', icon: '🧼', color: '#14b8a6' } }),
  ])

  // Create Suppliers
  const suppliers = await Promise.all([
    db.supplier.create({ data: { name: 'Afghan Pharma Import', code: 'SUP-001', contactPerson: 'Hamidullah Stanikzai', phone: '+93-700-500001', email: 'info@afghanpharma.com', city: 'Kabul', balance: 150000 } }),
    db.supplier.create({ data: { name: 'Global Medical Supplies', code: 'SUP-002', contactPerson: 'Zabih Mohammadi', phone: '+93-700-500002', email: 'orders@globalmed.com', city: 'Dubai', balance: 320000 } }),
    db.supplier.create({ data: { name: 'Pak Pharma Distributors', code: 'SUP-003', contactPerson: 'Kamran Yousufi', phone: '+93-700-500003', email: 'sales@pakpharma.com', city: 'Peshawar', balance: 85000 } }),
    db.supplier.create({ data: { name: 'Indian Pharmaceutical Co', code: 'SUP-004', contactPerson: 'Rajesh Kumar', phone: '+93-700-500004', email: 'export@indpharma.com', city: 'Mumbai', balance: 200000 } }),
  ])

  // Create Medicines
  const medicines = [
    { name: 'Paracetamol 500mg', slug: 'paracetamol-500mg', genericName: 'Paracetamol', brandName: 'Zargoon Acetamin', categoryId: categories[0].id, supplierId: suppliers[0].id, sku: 'MED-001', barcode: '8901234001', dosageForm: 'tablet', strength: '500mg', unit: 'box', packSize: 100, price: 150, costPrice: 90, taxRate: 5, minStock: 50, maxStock: 2000, prescriptionRequired: false },
    { name: 'Ibuprofen 400mg', slug: 'ibuprofen-400mg', genericName: 'Ibuprofen', brandName: 'Zargoon Profen', categoryId: categories[0].id, supplierId: suppliers[1].id, sku: 'MED-002', barcode: '8901234002', dosageForm: 'tablet', strength: '400mg', unit: 'box', packSize: 50, price: 200, costPrice: 120, taxRate: 5, minStock: 30, maxStock: 1500, prescriptionRequired: false },
    { name: 'Amoxicillin 500mg', slug: 'amoxicillin-500mg', genericName: 'Amoxicillin', brandName: 'Zargoon Amoxi', categoryId: categories[1].id, supplierId: suppliers[2].id, sku: 'MED-003', barcode: '8901234003', dosageForm: 'capsule', strength: '500mg', unit: 'box', packSize: 30, price: 350, costPrice: 200, taxRate: 0, minStock: 20, maxStock: 800, prescriptionRequired: true },
    { name: 'Azithromycin 250mg', slug: 'azithromycin-250mg', genericName: 'Azithromycin', brandName: 'Zargoon Azithro', categoryId: categories[1].id, supplierId: suppliers[3].id, sku: 'MED-004', barcode: '8901234004', dosageForm: 'tablet', strength: '250mg', unit: 'box', packSize: 6, price: 450, costPrice: 280, taxRate: 0, minStock: 15, maxStock: 500, prescriptionRequired: true },
    { name: 'Vitamin D3 1000IU', slug: 'vitamin-d3-1000iu', genericName: 'Cholecalciferol', brandName: 'Zargoon Vita-D', categoryId: categories[2].id, supplierId: suppliers[0].id, sku: 'MED-005', barcode: '8901234005', dosageForm: 'tablet', strength: '1000IU', unit: 'bottle', packSize: 60, price: 500, costPrice: 300, taxRate: 5, minStock: 25, maxStock: 1000, prescriptionRequired: false },
    { name: 'Multivitamin Complex', slug: 'multivitamin-complex', genericName: 'Multivitamin', brandName: 'Zargoon Multi-V', categoryId: categories[2].id, supplierId: suppliers[1].id, sku: 'MED-006', barcode: '8901234006', dosageForm: 'tablet', strength: 'Complex', unit: 'bottle', packSize: 90, price: 650, costPrice: 400, taxRate: 5, minStock: 20, maxStock: 800, prescriptionRequired: false },
    { name: 'Amlodipine 5mg', slug: 'amlodipine-5mg', genericName: 'Amlodipine', brandName: 'Zargoon Amlip', categoryId: categories[3].id, supplierId: suppliers[2].id, sku: 'MED-007', barcode: '8901234007', dosageForm: 'tablet', strength: '5mg', unit: 'box', packSize: 30, price: 280, costPrice: 160, taxRate: 0, minStock: 30, maxStock: 1200, prescriptionRequired: true },
    { name: 'Metformin 500mg', slug: 'metformin-500mg', genericName: 'Metformin', brandName: 'Zargoon Metfo', categoryId: categories[4].id, supplierId: suppliers[3].id, sku: 'MED-008', barcode: '8901234008', dosageForm: 'tablet', strength: '500mg', unit: 'box', packSize: 100, price: 180, costPrice: 100, taxRate: 0, minStock: 40, maxStock: 2000, prescriptionRequired: true },
    { name: 'Insulin Glargine 100IU/ml', slug: 'insulin-glargine', genericName: 'Insulin Glargine', brandName: 'Zargoon Insu', categoryId: categories[4].id, supplierId: suppliers[1].id, sku: 'MED-009', barcode: '8901234009', dosageForm: 'injection', strength: '100IU/ml', unit: 'piece', packSize: 1, price: 2500, costPrice: 1800, taxRate: 0, minStock: 10, maxStock: 200, prescriptionRequired: true, controlled: true, temperatureZone: 'refrigerated' },
    { name: 'Salbutamol Inhaler', slug: 'salbutamol-inhaler', genericName: 'Salbutamol', brandName: 'Zargoon Breath', categoryId: categories[5].id, supplierId: suppliers[0].id, sku: 'MED-010', barcode: '8901234010', dosageForm: 'inhaler', strength: '100mcg', unit: 'piece', packSize: 1, price: 800, costPrice: 500, taxRate: 0, minStock: 15, maxStock: 300, prescriptionRequired: true },
    { name: 'Hydrocortisone Cream 1%', slug: 'hydrocortisone-cream', genericName: 'Hydrocortisone', brandName: 'Zargoon Derma', categoryId: categories[6].id, supplierId: suppliers[2].id, sku: 'MED-011', barcode: '8901234011', dosageForm: 'cream', strength: '1%', unit: 'tube', packSize: 1, price: 350, costPrice: 200, taxRate: 5, minStock: 20, maxStock: 500, prescriptionRequired: false },
    { name: 'Omeprazole 20mg', slug: 'omeprazole-20mg', genericName: 'Omeprazole', brandName: 'Zargoon Omep', categoryId: categories[7].id, supplierId: suppliers[3].id, sku: 'MED-012', barcode: '8901234012', dosageForm: 'capsule', strength: '20mg', unit: 'box', packSize: 30, price: 250, costPrice: 140, taxRate: 5, minStock: 25, maxStock: 1000, prescriptionRequired: true },
    { name: 'Ciprofloxacin Eye Drops', slug: 'ciprofloxacin-eye-drops', genericName: 'Ciprofloxacin', brandName: 'Zargoon Vision', categoryId: categories[8].id, supplierId: suppliers[1].id, sku: 'MED-013', barcode: '8901234013', dosageForm: 'drops', strength: '0.3%', unit: 'bottle', packSize: 1, price: 280, costPrice: 160, taxRate: 5, minStock: 15, maxStock: 400, prescriptionRequired: true },
    { name: 'Bandage Roll', slug: 'bandage-roll', genericName: 'Bandage', brandName: 'Zargoon Care', categoryId: categories[9].id, supplierId: suppliers[0].id, sku: 'MED-014', barcode: '8901234014', dosageForm: null, strength: null, unit: 'piece', packSize: 1, price: 80, costPrice: 40, taxRate: 5, minStock: 100, maxStock: 3000, prescriptionRequired: false },
    { name: 'Baby Diaper Pack', slug: 'baby-diaper-pack', genericName: 'Diaper', brandName: 'Zargoon Baby', categoryId: categories[10].id, supplierId: suppliers[2].id, sku: 'MED-015', barcode: '8901234015', dosageForm: null, strength: null, unit: 'pack', packSize: 1, price: 1200, costPrice: 800, taxRate: 5, minStock: 20, maxStock: 500, prescriptionRequired: false },
    { name: 'Hand Sanitizer 500ml', slug: 'hand-sanitizer', genericName: 'Ethanol', brandName: 'Zargoon Clean', categoryId: categories[11].id, supplierId: suppliers[0].id, sku: 'MED-016', barcode: '8901234016', dosageForm: null, strength: '70%', unit: 'bottle', packSize: 1, price: 250, costPrice: 130, taxRate: 5, minStock: 50, maxStock: 2000, prescriptionRequired: false },
    { name: 'Aspirin 75mg', slug: 'aspirin-75mg', genericName: 'Aspirin', brandName: 'Zargoon Aspir', categoryId: categories[3].id, supplierId: suppliers[3].id, sku: 'MED-017', barcode: '8901234017', dosageForm: 'tablet', strength: '75mg', unit: 'box', packSize: 56, price: 120, costPrice: 70, taxRate: 5, minStock: 30, maxStock: 1500, prescriptionRequired: false },
    { name: 'Omega-3 Fish Oil', slug: 'omega-3-fish-oil', genericName: 'Omega-3', brandName: 'Zargoon Omega', categoryId: categories[2].id, supplierId: suppliers[1].id, sku: 'MED-018', barcode: '8901234018', dosageForm: 'capsule', strength: '1000mg', unit: 'bottle', packSize: 90, price: 850, costPrice: 520, taxRate: 5, minStock: 15, maxStock: 600, prescriptionRequired: false },
    { name: 'Cetirizine 10mg', slug: 'cetirizine-10mg', genericName: 'Cetirizine', brandName: 'Zargoon Allergo', categoryId: categories[5].id, supplierId: suppliers[0].id, sku: 'MED-019', barcode: '8901234019', dosageForm: 'tablet', strength: '10mg', unit: 'box', packSize: 30, price: 180, costPrice: 100, taxRate: 5, minStock: 25, maxStock: 1000, prescriptionRequired: false },
    { name: 'Diclofenac Gel 1%', slug: 'diclofenac-gel', genericName: 'Diclofenac', brandName: 'Zargoon Relief', categoryId: categories[0].id, supplierId: suppliers[2].id, sku: 'MED-020', barcode: '8901234020', dosageForm: 'gel', strength: '1%', unit: 'tube', packSize: 1, price: 320, costPrice: 180, taxRate: 5, minStock: 20, maxStock: 600, prescriptionRequired: false },
  ]

  const createdMedicines = []
  for (const med of medicines) {
    const medicine = await db.medicine.create({ data: med })
    createdMedicines.push(medicine)
  }

  // Create Inventory
  for (const med of createdMedicines) {
    const numBatches = Math.floor(Math.random() * 3) + 1
    for (let b = 0; b < numBatches; b++) {
      const qty = Math.floor(Math.random() * (med.maxStock - med.minStock)) + med.minStock
      const daysToExpiry = Math.floor(Math.random() * 730) + 30 // 30 days to 2 years
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + daysToExpiry)
      const mfgDate = new Date()
      mfgDate.setMonth(mfgDate.getMonth() - Math.floor(Math.random() * 12) - 1)

      const status = qty <= med.minStock ? 'low_stock' : expiryDate < new Date() ? 'expired' : 'in_stock'

      await db.inventory.create({
        data: {
          medicineId: med.id,
          branchId: mainBranch.id,
          warehouseId: wh1.id,
          batchNumber: `BN-${Date.now()}-${b}`,
          quantity: qty,
          reservedQty: Math.floor(Math.random() * 5),
          costPrice: med.costPrice,
          sellingPrice: med.price,
          manufactureDate: mfgDate,
          expiryDate,
          location: `Aisle-${String.fromCharCode(65 + Math.floor(Math.random() * 10))}-${Math.floor(Math.random() * 20) + 1}`,
          status,
        }
      })
    }
  }

  // Create Customers
  const customerNames = [
    { name: 'Hamid Stanikzai', email: 'hamid@example.com', phone: '+93-700-200001' },
    { name: 'Mariam Nabizada', email: 'mariam@example.com', phone: '+93-700-200002' },
    { name: 'Zubair Mohammadi', email: 'zubair@example.com', phone: '+93-700-200003' },
    { name: 'Nasrin Akbari', email: 'nasrin@example.com', phone: '+93-700-200004' },
    { name: 'Farid Qaderi', email: 'farid@example.com', phone: '+93-700-200005' },
    { name: 'Laila Haidari', email: 'laila@example.com', phone: '+93-700-200006' },
    { name: 'Wahid Rezai', email: 'wahid@example.com', phone: '+93-700-200007' },
    { name: 'Zahra Safi', email: 'zahra@example.com', phone: '+93-700-200008' },
    { name: 'Mustafa Nadem', email: 'mustafa@example.com', phone: '+93-700-200009' },
    { name: 'Farzana Kochai', email: 'farzana@example.com', phone: '+93-700-200010' },
  ]

  const customers = []
  for (const c of customerNames) {
    const customer = await db.customer.create({
      data: {
        ...c,
        address: `Street ${Math.floor(Math.random() * 100) + 1}, Kabul`,
        city: 'Kabul',
        gender: ['Male', 'Female'][Math.floor(Math.random() * 2)],
        loyaltyPoints: Math.floor(Math.random() * 5000),
        totalSpent: Math.floor(Math.random() * 50000) + 1000,
        totalOrders: Math.floor(Math.random() * 50) + 1,
      }
    })
    customers.push(customer)
  }

  // Create Sales
  const paymentMethods = ['cash', 'card', 'mobile']
  for (let i = 0; i < 30; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const cashier = users[Math.floor(Math.random() * users.length)]
    const numItems = Math.floor(Math.random() * 4) + 1
    const saleItems = []
    const usedMedicines = new Set<string>()

    for (let j = 0; j < numItems; j++) {
      const medIdx = Math.floor(Math.random() * createdMedicines.length)
      if (usedMedicines.has(createdMedicines[medIdx].id)) continue
      usedMedicines.add(createdMedicines[medIdx].id)
      const qty = Math.floor(Math.random() * 5) + 1
      saleItems.push({
        medicineId: createdMedicines[medIdx].id,
        quantity: qty,
        unitPrice: createdMedicines[medIdx].price,
        costPrice: createdMedicines[medIdx].costPrice,
        discount: Math.random() > 0.8 ? 5 : 0,
        taxRate: createdMedicines[medIdx].taxRate,
        totalPrice: qty * createdMedicines[medIdx].price * (1 + createdMedicines[medIdx].taxRate / 100),
      })
    }

    const subtotal = saleItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const taxAmount = saleItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.taxRate / 100), 0)
    const discountAmount = saleItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.discount / 100), 0)
    const totalAmount = subtotal + taxAmount - discountAmount
    const paidAmount = totalAmount
    const saleDate = new Date()
    saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 30))

    const sale = await db.sale.create({
      data: {
        invoiceNumber: `INV-${String(10000 + i).padStart(6, '0')}`,
        branchId: mainBranch.id,
        customerId: customer.id,
        cashierId: cashier.id,
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        paidAmount: Math.round(paidAmount * 100) / 100,
        changeAmount: 0,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        paymentStatus: 'paid',
        saleType: Math.random() > 0.3 ? 'pos' : 'online',
        createdAt: saleDate,
        items: { create: saleItems },
      }
    })

    // Add a review for some sales
    if (Math.random() > 0.6 && saleItems.length > 0) {
      await db.review.create({
        data: {
          customerId: customer.id,
          medicineId: saleItems[0].medicineId,
          rating: Math.floor(Math.random() * 3) + 3,
          comment: ['Great product!', 'Very effective', 'Good value for money', 'Fast relief', 'Excellent quality'][Math.floor(Math.random() * 5)],
          isVerified: true,
        }
      })
    }
  }

  // Create Notifications
  await Promise.all([
    db.notification.create({ data: { userId: users[0].id, title: 'Low Stock Alert', message: 'Amoxicillin 500mg is running low on stock (5 units remaining)', type: 'warning', category: 'inventory' } }),
    db.notification.create({ data: { userId: users[0].id, title: 'Expiry Warning', message: '3 medicine batches expiring within 30 days', type: 'warning', category: 'inventory' } }),
    db.notification.create({ data: { userId: users[0].id, title: 'New Order Received', message: 'Online order #ORD-000123 needs processing', type: 'info', category: 'order' } }),
    db.notification.create({ data: { userId: users[0].id, title: 'Daily Sales Target', message: 'Today\'s sales have reached 85% of daily target', type: 'success', category: 'sales' } }),
    db.notification.create({ data: { userId: users[0].id, title: 'New Customer Registration', message: 'A new customer has registered on the online pharmacy', type: 'info', category: 'system' } }),
    db.notification.create({ data: { userId: users[0].id, title: 'Shift Update', message: 'Your shift for tomorrow has been updated', type: 'info', category: 'hr' } }),
  ])

  // Create Activity Logs
  const activities = [
    { userId: users[0].id, action: 'LOGIN', entity: 'User', details: 'Admin logged in' },
    { userId: users[1].id, action: 'CREATE', entity: 'Sale', details: 'Created sale INV-001000' },
    { userId: users[0].id, action: 'UPDATE', entity: 'Inventory', details: 'Updated stock for Paracetamol 500mg' },
    { userId: users[2].id, action: 'DISPENSE', entity: 'Prescription', details: 'Dispensed prescription PRX-001' },
    { userId: users[3].id, action: 'CREATE', entity: 'Sale', details: 'Created online order' },
  ]
  for (const act of activities) {
    await db.activityLog.create({ data: act })
  }

  // Create Settings
  const settings = [
    { key: 'pharmacy_name', value: 'Zargoon Pharmacy', category: 'general' },
    { key: 'pharmacy_phone', value: '+93-700-123456', category: 'general' },
    { key: 'pharmacy_address', value: 'Karta-e-Mamorin, Kabul, Afghanistan', category: 'general' },
    { key: 'currency', value: 'AFN', category: 'general' },
    { key: 'tax_enabled', value: 'true', category: 'billing' },
    { key: 'default_tax_rate', value: '5', category: 'billing' },
    { key: 'low_stock_threshold', value: '10', category: 'inventory' },
    { key: 'expiry_alert_days', value: '30', category: 'inventory' },
    { key: 'loyalty_points_rate', value: '1', category: 'billing' },
    { key: 'delivery_fee', value: '50', category: 'billing' },
  ]
  for (const setting of settings) {
    await db.setting.create({ data: setting })
  }

  // Create Promotions
  await Promise.all([
    db.promotion.create({ data: { title: 'Summer Health Sale', description: 'Get 15% off on all vitamins', type: 'percentage', value: 15, code: 'SUMMER15', minOrder: 500, startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), usageLimit: 100 } }),
    db.promotion.create({ data: { title: 'First Order Discount', description: 'AFN 100 off on your first order', type: 'fixed', value: 100, code: 'FIRST100', minOrder: 300, startDate: new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), usageLimit: 500 } }),
    db.promotion.create({ data: { title: 'Buy 1 Get 1', description: 'Buy 1 get 1 free on selected items', type: 'bogo', value: 100, code: 'BOGO2024', minOrder: 0, startDate: new Date(), endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), usageLimit: 50 } }),
  ])

  // Create Expenses
  const expenseCategories = ['rent', 'utilities', 'supplies', 'maintenance', 'salary', 'other']
  for (let i = 0; i < 15; i++) {
    await db.expense.create({
      data: {
        branchId: mainBranch.id,
        category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
        amount: Math.floor(Math.random() * 20000) + 1000,
        description: `Monthly ${expenseCategories[Math.floor(Math.random() * expenseCategories.length)]} payment`,
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        recordedBy: users[0].id,
      }
    })
  }

  // Create Payroll records
  for (const user of users) {
    const baseSalaries: Record<string, number> = { super_admin: 80000, admin: 60000, manager: 50000, pharmacist: 40000, cashier: 25000, staff: 20000 }
    const basic = baseSalaries[user.role] || 25000
    const overtime = Math.floor(Math.random() * 20) * 250
    const bonus = Math.random() > 0.7 ? 5000 : 0
    const tax = basic * 0.1
    const deductions = 2000

    await db.payroll.create({
      data: {
        userId: user.id,
        month: '2025-06',
        basicSalary: basic,
        overtimeHours: Math.floor(Math.random() * 20),
        overtimeAmount: overtime,
        bonus,
        deductions,
        tax,
        netSalary: basic + overtime + bonus - deductions - tax,
        status: Math.random() > 0.5 ? 'paid' : 'pending',
        paidAt: Math.random() > 0.5 ? new Date() : null,
      }
    })
  }

  // Create Shifts
  for (const user of users) {
    for (let d = 0; d < 7; d++) {
      const shiftDate = new Date()
      shiftDate.setDate(shiftDate.getDate() + d)
      const startHour = Math.random() > 0.5 ? 8 : 14
      const startTime = new Date(shiftDate)
      startTime.setHours(startHour, 0, 0)
      const endTime = new Date(shiftDate)
      endTime.setHours(startHour + 8, 0, 0)

      await db.shift.create({
        data: {
          userId: user.id,
          date: shiftDate,
          startTime,
          endTime,
          branchId: user.branchId,
          status: d === 0 ? 'in_progress' : 'scheduled',
        }
      })
    }
  }

  // Create Online Orders
  for (let i = 0; i < 8; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const numItems = Math.floor(Math.random() * 3) + 1
    const orderItemsData: { medicineId: string; name: string; qty: number; price: number }[] = []
    const usedMeds = new Set<string>()

    for (let j = 0; j < numItems; j++) {
      const medIdx = Math.floor(Math.random() * createdMedicines.length)
      if (usedMeds.has(createdMedicines[medIdx].id)) continue
      usedMeds.add(createdMedicines[medIdx].id)
      orderItemsData.push({
        medicineId: createdMedicines[medIdx].id,
        name: createdMedicines[medIdx].name,
        qty: Math.floor(Math.random() * 3) + 1,
        price: createdMedicines[medIdx].price,
      })
    }

    const subtotal = orderItemsData.reduce((sum, item) => sum + item.price * item.qty, 0)
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

    await db.order.create({
      data: {
        orderNumber: `ORD-${String(100 + i).padStart(6, '0')}`,
        customerId: customer.id,
        items: JSON.stringify(orderItemsData),
        subtotal,
        taxAmount: Math.round(subtotal * 0.05 * 100) / 100,
        discountAmount: 0,
        deliveryFee: 50,
        totalAmount: Math.round((subtotal * 1.05 + 50) * 100) / 100,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        paymentStatus: Math.random() > 0.3 ? 'paid' : 'pending',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        shippingAddress: customer.address || 'Street 10, Kabul',
        city: customer.city || 'Kabul',
        phone: customer.phone,
        trackingNumber: `TRK${Date.now()}${i}`,
      }
    })
  }

  return { seeded: true, message: 'Database seeded successfully' }
}
