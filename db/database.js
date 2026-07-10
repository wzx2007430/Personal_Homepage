import initSqlJs from 'sql.js'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHmac, createHash, randomBytes } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, 'data.db')

let db = null
let initPromise = null

export async function getDb() {
  if (db) return db
  if (initPromise) return initPromise

  initPromise = (async () => {
    const SQL = await initSqlJs()

    if (existsSync(DB_PATH)) {
      const buffer = readFileSync(DB_PATH)
      db = new SQL.Database(buffer)
      ensureSchema()
    } else {
      db = new SQL.Database()
      db.run("CREATE TABLE IF NOT EXISTS profile (key TEXT PRIMARY KEY, value TEXT)")
      db.run("CREATE TABLE IF NOT EXISTS links (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', call_number TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0)")
      db.run("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)")
      // 插入默认数据
      const ps = db.prepare("INSERT OR IGNORE INTO profile (key, value) VALUES (?, ?)")
      ps.run(['name', '张三'])
      ps.run(['avatar', '🧑‍💻'])
      ps.run(['bio', '全栈开发者 · 开源爱好者 · 终身学习者\n关注前端技术与数字产品设计'])
      ps.free()
      // 设置默认项
      const ss = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)")
      ss.run(['password_hash', hashPassword('admin123')])
      ss.run(['favicon_url', ''])
      ss.run(['icp_number', ''])
      ss.run(['police_number', ''])
      ss.free()
      // 默认链接
      const ls = db.prepare("INSERT INTO links (title, url, description, call_number, sort_order) VALUES (?, ?, ?, ?, ?)")
      ls.run(['博客', 'https://blog.example.com', '技术文章与开发心得', 'Z 001', 1])
      ls.run(['网盘', 'https://drive.example.com', '个人云存储与文件分享', 'Z 002', 2])
      ls.run(['摄影', 'https://photo.example.com', '生活记录与旅行随拍', 'Z 003', 3])
      ls.run(['GitHub', 'https://github.com', '开源项目与代码仓库', 'Z 004', 4])
      ls.free()

      saveDb()
    }

    return db
  })()

  return initPromise
}

// ===== 密码哈希（HMAC-SHA256 + 随机盐，向后兼容旧 SHA256） =====

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = createHmac('sha256', salt).update(password).digest('hex')
  return salt + ':' + hash
}

export function verifyPassword(password) {
  const stmt = db.prepare("SELECT value FROM settings WHERE key = 'password_hash'")
  let stored = ''
  if (stmt.step()) stored = stmt.getAsObject().value
  stmt.free()
  if (!stored) return false
  // 新格式 salt:hash
  if (stored.includes(':')) {
    const [salt, hash] = stored.split(':')
    return createHmac('sha256', salt).update(password).digest('hex') === hash
  }
  // 向后兼容旧格式（纯 SHA256）
  return createHash('sha256').update(password).digest('hex') === stored
}

export function changePassword(newPassword) {
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('password_hash', ?)")
  stmt.run([hashPassword(newPassword)])
  stmt.free()
  saveDb()
}

// ===== Schema 迁移（全部使用参数化查询） =====

function ensureSchema() {
  try {
    db.run("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)")
    // 缺失的 setting 键
    const keys = ['favicon_url', 'icp_number', 'police_number']
    const checkStmt = db.prepare("SELECT value FROM settings WHERE key = ?")
    const insertStmt = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, '')")
    for (const key of keys) {
      checkStmt.bind([key])
      const exists = checkStmt.step()
      checkStmt.reset()
      if (!exists) insertStmt.run([key])
    }
    checkStmt.free()
    insertStmt.free()
    // 兼容旧表：如果没有 call_number 列则添加
    try { db.run("ALTER TABLE links ADD COLUMN call_number TEXT NOT NULL DEFAULT ''") } catch (e) { /* 已存在 */ }
    saveDb()
  } catch (e) { /* 忽略迁移错误 */ }
}

// ===== 持久化 =====

export function saveDb() {
  if (!db) return
  const data = db.export()
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(DB_PATH, Buffer.from(data))
}

// ===== Settings =====

export async function getSetting(key) {
  await getDb()
  const stmt = db.prepare("SELECT value FROM settings WHERE key = ?")
  stmt.bind([key])
  let result = ''
  if (stmt.step()) result = stmt.getAsObject().value
  stmt.free()
  return result
}

export async function setSetting(key, value) {
  await getDb()
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
  stmt.run([key, value])
  stmt.free()
  saveDb()
}

export async function getPublicSettings() {
  await getDb()
  const result = {}
  const stmt = db.prepare("SELECT key, value FROM settings WHERE key IN ('favicon_url', 'icp_number', 'police_number')")
  while (stmt.step()) { const r = stmt.getAsObject(); result[r.key] = r.value }
  stmt.free()
  for (const k of ['favicon_url', 'icp_number', 'police_number']) { if (!(k in result)) result[k] = '' }
  return result
}

export async function updatePublicSettings(data) {
  await getDb()
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
  for (const key of ['favicon_url', 'icp_number', 'police_number']) {
    if (key in data) stmt.run([key, data[key]])
  }
  stmt.free()
  saveDb()
}

// ===== Profile =====

export async function getProfile() {
  await getDb()
  const result = {}
  const stmt = db.prepare("SELECT key, value FROM profile")
  while (stmt.step()) { const r = stmt.getAsObject(); result[r.key] = r.value }
  stmt.free()
  return result
}

export async function updateProfile(data) {
  await getDb()
  const stmt = db.prepare("INSERT OR REPLACE INTO profile (key, value) VALUES (?, ?)")
  for (const [key, value] of Object.entries(data)) { stmt.run([key, value]) }
  stmt.free()
  saveDb()
}

// ===== Links =====

export async function getLinks() {
  await getDb()
  const stmt = db.prepare("SELECT id, title, url, description, call_number FROM links ORDER BY sort_order ASC, id ASC")
  const links = []
  while (stmt.step()) { links.push(stmt.getAsObject()) }
  stmt.free()
  return links
}

export async function updateLinks(links) {
  await getDb()
  db.run("DELETE FROM links")
  const stmt = db.prepare("INSERT INTO links (title, url, description, call_number, sort_order) VALUES (?, ?, ?, ?, ?)")
  links.forEach((link, index) => {
    stmt.run([link.title, link.url, link.description, link.callNumber || '', index + 1])
  })
  stmt.free()
  saveDb()
}
