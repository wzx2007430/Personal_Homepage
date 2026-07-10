import express from 'express'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  getDb, getProfile, updateProfile, getLinks, updateLinks,
  verifyPassword, changePassword, getPublicSettings, updatePublicSettings
} from './db/database.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3456

app.use(express.json())

// ===== 简单的速率限制（防暴力破解） =====
const rateLimit = new Map()
function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimit.get(key)
  if (!record || now - record.start > windowMs) {
    rateLimit.set(key, { start: now, count: 1 })
    return true
  }
  record.count++
  return record.count <= maxAttempts
}
app.use('/api/auth', (req, res, next) => {
  const key = req.ip || 'unknown'
  if (!checkRateLimit(key)) {
    return res.status(429).json({ error: '请求过于频繁，请稍后再试' })
  }
  next()
})

// ===== Auth =====
app.post('/api/auth/verify', async (req, res) => {
  try {
    await getDb()
    const valid = verifyPassword(req.body.password || '')
    res.json({ valid })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/auth/change-password', async (req, res) => {
  try {
    await getDb()
    const { oldPassword, newPassword } = req.body
    if (!verifyPassword(oldPassword)) return res.status(403).json({ error: '原密码错误' })
    if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: '新密码至少4位' })
    changePassword(newPassword)
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ===== Settings =====
app.get('/api/settings', async (req, res) => {
  try { await getDb(); res.json(await getPublicSettings()) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/settings', async (req, res) => {
  try { await getDb(); await updatePublicSettings(req.body); res.json({ ok: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

// ===== Profile =====
app.get('/api/profile', async (req, res) => {
  try { await getDb(); res.json(await getProfile()) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/profile', async (req, res) => {
  try { await getDb(); await updateProfile(req.body); res.json({ ok: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

// ===== Links =====
app.get('/api/links', async (req, res) => {
  try { await getDb(); res.json(await getLinks()) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/links', async (req, res) => {
  try { await getDb(); await updateLinks(req.body); res.json({ ok: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

// ===== Static =====
const distPath = join(__dirname, 'dist')
app.use(express.static(distPath))
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(join(distPath, 'index.html'))
})

// Start
await getDb()
console.log('Database ready')

app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT)
})
