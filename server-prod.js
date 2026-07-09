import express from 'express'
import {
  getDb, getProfile, updateProfile, getLinks, updateLinks,
  verifyPassword, changePassword, getPublicSettings, updatePublicSettings
} from './db/database.js'

const app = express()
const PORT = process.env.PORT || 3456

app.use(express.json())

// ?? API ??
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.set('Pragma', 'no-cache')
  next()
})

// ===== Auth =====
app.post('/api/auth/verify', async (req, res) => {
  try {
    await getDb()
    res.json({ valid: verifyPassword(req.body.password || '') })
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

// 启动
await getDb()
console.log('Database ready')

app.listen(PORT, '127.0.0.1', () => {
  console.log('API server running on http://127.0.0.1:' + PORT)
})
