import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
// ensure uploads dir (stable path relative to this file) and serve static
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')
const LEGACY_UPLOADS_DIR = path.join(__dirname, 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}
// Serve both new and legacy upload locations under the same route
app.use('/uploads', express.static(UPLOADS_DIR), express.static(LEGACY_UPLOADS_DIR))

const PORT = process.env.PORT || 3002
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hesen'
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

// Multer setup for single image upload (UPLOAD BEFORE ROUTES)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname) || ''
    cb(null, `${unique}${ext}`)
  },
})
const fileFilter = (_req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true)
  else cb(new Error('Sadece görsel yükleyin'))
}
const upload = multer({ storage, fileFilter, limits: { files: 1, fileSize: 5 * 1024 * 1024 } })

// MongoDB bağlantı olayları (durum logları)
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB bağlantısı başarılı')
})
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB bağlantı hatası:', err?.message || err)
})
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB bağlantısı kesildi')
})

// Schemas
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    image: { type: String, default: '' }, // stored as "/uploads/<filename>"
  },
  { timestamps: true }
)

const StoreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    owner: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String },
    phone: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    active: { type: Boolean, default: false },
    products: { type: [ProductSchema], default: [] },
  },
  { timestamps: true }
)

// Ensure `id` in JSON for frontend compatibility
StoreSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id
    if (Array.isArray(ret.products)) {
      ret.products = ret.products.map((p) => ({ ...p, id: p._id }))
    }
    return ret
  },
})

const Store = mongoose.model('Store', StoreSchema)

// Routes
app.post('/api/stores', async (req, res) => {
  try {
    const { name, owner, email, phone, description, password } = req.body || {}
    if (!name || !owner || !email || !phone || !password) {
      return res.status(400).json({ message: 'Gerekli alanlar eksik.' })
    }
    const exists = await Store.findOne({ email: email.toLowerCase() })
    if (exists) return res.status(409).json({ message: 'Bu e-posta ile kayıt mevcut.' })
    const passwordHash = await bcrypt.hash(password, 10)
    const store = await Store.create({ name, owner, email, phone, description, passwordHash })
    res.json(store.toJSON())
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası', error: String(e) })
  }
})

app.get('/api/stores', async (_req, res) => {
  try {
    const stores = await Store.find({}).sort({ createdAt: -1 })
    res.json(stores.map((s) => s.toJSON()))
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası', error: String(e) })
  }
})

app.get('/api/stores/approved', async (_req, res) => {
  try {
    const approved = await Store.find({ status: 'approved', active: true }).sort({ createdAt: -1 })
    res.json(approved.map((s) => s.toJSON()))
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası', error: String(e) })
  }
})

app.post('/api/stores/:id/approve', async (req, res) => {
  try {
    const { id } = req.params
    const store = await Store.findByIdAndUpdate(id, { status: 'approved' }, { new: true })
    if (!store) return res.status(404).json({ message: 'Mağaza bulunamadı' })
    res.json(store.toJSON())
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası', error: String(e) })
  }
})

app.post('/api/stores/:id/reject', async (req, res) => {
  try {
    const { id } = req.params
    const store = await Store.findByIdAndUpdate(id, { status: 'rejected', active: false }, { new: true })
    if (!store) return res.status(404).json({ message: 'Mağaza bulunamadı' })
    res.json(store.toJSON())
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası', error: String(e) })
  }
})

app.post('/api/stores/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params
    const store = await Store.findById(id)
    if (!store) return res.status(404).json({ message: 'Mağaza bulunamadı' })
    store.active = !store.active
    await store.save()
    res.json({ id: store.id, active: store.active })
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası', error: String(e) })
  }
})

app.post('/api/products/:storeId', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { storeId } = req.params
    const { name, price, stock } = req.body || {}
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'Ürün bilgileri eksik.' })
    }
    const store = await Store.findById(storeId)
    if (!store) return res.status(404).json({ message: 'Mağaza bulunamadı' })
    if (String(store.id) !== String(req.auth.storeId)) {
      return res.status(403).json({ message: 'Sadece kendi mağazanıza ürün ekleyebilirsiniz.' })
    }
    const imagePath = req.file ? `/uploads/${req.file.filename}` : ''
    store.products.push({ name, price: Number(price), stock: Number(stock), image: imagePath })
    await store.save()
    const product = store.products[store.products.length - 1]
    res.json(product)
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası', error: String(e) })
  }
})

// Update a product (owner)
app.patch('/api/products/:storeId/:productId', requireAuth, async (req, res) => {
  try {
    const { storeId, productId } = req.params
    const { name, price, stock } = req.body || {}
    const store = await Store.findById(storeId)
    if (!store) return res.status(404).json({ message: 'Mağaza bulunamadı' })
    if (String(store.id) !== String(req.auth.storeId)) {
      return res.status(403).json({ message: 'Sadece kendi mağazanızı düzenleyebilirsiniz.' })
    }
    const product = store.products.id(productId)
    if (!product) return res.status(404).json({ message: 'Ürün bulunamadı' })
    if (name !== undefined) product.name = name
    if (price !== undefined) product.price = Number(price)
    if (stock !== undefined) product.stock = Number(stock)
    await store.save()
    res.json(product)
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası', error: String(e) })
  }
})

// Delete a product (owner)
app.delete('/api/products/:storeId/:productId', requireAuth, async (req, res) => {
  try {
    const { storeId, productId } = req.params
    const store = await Store.findById(storeId)
    if (!store) return res.status(404).json({ message: 'Mağaza bulunamadı' })
    if (String(store.id) !== String(req.auth.storeId)) {
      return res.status(403).json({ message: 'Sadece kendi mağazanızı düzenleyebilirsiniz.' })
    }
    const product = store.products.id(productId)
    if (!product) return res.status(404).json({ message: 'Ürün bulunamadı' })
    product.deleteOne()
    await store.save()
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası', error: String(e) })
  }
})
// Auth helper
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Yetkisiz' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.auth = payload
    next()
  } catch (e) {
    return res.status(401).json({ message: 'Geçersiz token' })
  }
}

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ message: 'Email ve şifre zorunlu' })
    const store = await Store.findOne({ email: email.toLowerCase() })
    if (!store || !store.passwordHash) return res.status(401).json({ message: 'Geçersiz kimlik' })
    const ok = await bcrypt.compare(password, store.passwordHash)
    if (!ok) return res.status(401).json({ message: 'Geçersiz kimlik' })
    const token = jwt.sign({ storeId: store.id, email: store.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, store: store.toJSON() })
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası', error: String(e) })
  }
})

// Current store by token
app.get('/api/me/store', requireAuth, async (req, res) => {
  try {
    const store = await Store.findById(req.auth.storeId)
    if (!store) return res.status(404).json({ message: 'Mağaza bulunamadı' })
    res.json(store.toJSON())
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası', error: String(e) })
  }
})

// Public store detail (only approved)
app.get('/api/stores/:id', async (req, res) => {
  try {
    const { id } = req.params
    const store = await Store.findById(id)
    if (!store) return res.status(404).json({ message: 'Mağaza bulunamadı' })
    if (store.status !== 'approved') return res.status(403).json({ message: 'Mağaza henüz onaylanmamış' })
    if (!store.active) return res.status(403).json({ message: 'Mağaza şu an pasif' })
    res.json(store.toJSON())
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası', error: String(e) })
  }
})

// (moved above to ensure it's defined before use)

// Delete a store (admin)
app.delete('/api/stores/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Store.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ message: 'Mağaza bulunamadı' })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası', error: String(e) })
  }
})

// Delete a product from a store (admin) — kept for admin tools
app.delete('/api/admin/products/:storeId/:productId', async (req, res) => {
  try {
    const { storeId, productId } = req.params
    const result = await Store.updateOne(
      { _id: storeId },
      { $pull: { products: { _id: productId } } }
    )
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Mağaza bulunamadı' })
    // Note: If no product matched, modifiedCount will be 0 but we still return ok for idempotency
    res.json({ ok: true, removed: result.modifiedCount > 0 })
  } catch (e) {
    res.status(500).json({ message: 'Sunucu hatası', error: String(e) })
  }
})

app.get('/health', (_req, res) => res.json({ ok: true }))

async function start() {
  try {
    await mongoose.connect(MONGODB_URI)
    // Bağlantı sonrası ek bilgi (opsiyonel)
    const name = mongoose.connection.name
    const host = mongoose.connection.host
    console.log(`🔌 Bağlantı: mongodb://${host}/${name}`)
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`)
    })
  } catch (e) {
    console.error('❌ MongoDB bağlantısı başarısız:', e?.message || e)
    process.exit(1)
  }
}

start()


