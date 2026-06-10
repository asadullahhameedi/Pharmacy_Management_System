import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = 3003

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

// Store connected users
const connectedUsers = new Map<string, string>()

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`)

  // Join pharmacy room
  socket.on('join-pharmacy', (data: { userId: string; pharmacyId: string }) => {
    connectedUsers.set(socket.id, data.userId)
    socket.join(`pharmacy-${data.pharmacyId}`)
    socket.join(`user-${data.userId}`)
    console.log(`[Socket] User ${data.userId} joined pharmacy ${data.pharmacyId}`)
  })

  // Sales events
  socket.on('new-sale', (data) => {
    socket.broadcast.emit('sale-created', data)
  })

  // Inventory events
  socket.on('inventory-update', (data) => {
    socket.broadcast.emit('inventory-updated', data)
  })

  // Order events
  socket.on('order-update', (data) => {
    socket.broadcast.emit('order-updated', data)
  })

  // Notification events
  socket.on('notification', (data: { userId: string; notification: any }) => {
    io.to(`user-${data.userId}`).emit('new-notification', data.notification)
  })

  // Chat events
  socket.on('chat-message', (data: { from: string; to: string; message: string }) => {
    io.to(`user-${data.to}`).emit('chat-message', data)
  })

  // Low stock alert
  socket.on('low-stock-alert', (data) => {
    socket.broadcast.emit('low-stock', data)
  })

  // Disconnect
  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id)
    console.log(`[Socket] Client disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`[Socket] Zargoon Socket.io service running on port ${PORT}`)
})
