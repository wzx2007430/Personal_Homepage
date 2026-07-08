import initSqlJs from 'sql.js'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, 'data.db')

let db = null
let initPromise = null

const DEFAULT_SETTINGS = {
  password_hash: '',
  favicon_url: '',
  icp_number: '',
  police_number: ''
}

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
      db.run("CREATE TABLE IF NOT EXISTS links (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0)")
      db.run("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)")
      db.run("INSERT OR IGNORE INTO profile (key, value) VALUES ('name', '张三')")
      db.run("INSERT OR IGNORE INTO profile (key, value) VALUES ('avatar', '🧑‍💻')")
      db.run("INSERT OR IGNORE INTO profile (key, value) VALUES ('bio', '全栈开发者 · 开源爱好者 · 终身学习者\n关注前端技术与数字产品设计')")
      db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('password_hash', '" + hashPassword('admin123') + "')")
      db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('favicon_url', '')")
      db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('icp_number', '')")
      db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('police_number', '')")

      const stmt = db.prepare("INSERT INTO links (title, url, description, sort_order) VALUES (?, ?, ?, ?)")
      stmt.run(['博客', 'https://blog.example.com', '技术文章与开发心得', 1])
      stmt.run(['网盘', 'https://drive.example.com', '个人云存储与文件分享', 2])
      stmt.run(['摄影', 'https://photo.example.com', '生活记录与旅行随拍', 3])
      stmt.run(['GitHub', 'https://github.com', '开源项目与代码仓库', 4])
      stmt.free()

      saveDb()
    }

    return db
  })()

  return initPromise
}

function ensureSchema() {
  try {
    db.run("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)")
    for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
      const check = db.exec("SELECT value FROM settings WHERE key = '" + key + "'")
      if (!check.length || !check[0].values.length) {
        db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('" + key + "', '')")
      }
    }
    saveDb()
  } catch (e) {
    // ignore
  }
}

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex')
}

export function verifyPassword(password) {
  const rows = db.exec("SELECT value FROM settings WHERE key = 'password_hash'")
  if (!rows.length || !rows[0].values.length) return false
  const storedHash = rows[0].values[0][0]
  return hashPassword(password) === storedHash
}

export function changePassword(newPassword) {
  const newHash = hashPassword(newPassword)
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('password_hash', ?)")
  stmt.run([newHash])
  stmt.free()
  saveDb()
}

export function saveDb() {
  if (!db) return
  const data = db.export()
  const buffer = Buffer.from(data)
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(DB_PATH, buffer)
}

// --- Settings ---

export async function getSetting(key) {
  await getDb()
  const stmt = db.prepare("SELECT value FROM settings WHERE key = ?")
  stmt.bind([key])
  let result = ''
  if (stmt.step()) {
    const row = stmt.getAsObject()
    result = row.value
  }
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

// 批量获取所有公开设置
export async function getPublicSettings() {
  await getDb()
  const result = {}
  const stmt = db.prepare("SELECT key, value FROM settings WHERE key IN ('favicon_url', 'icp_number', 'police_number')")
  while (stmt.step()) {
    const row = stmt.getAsObject()
    result[row.key] = row.value
  }
  stmt.free()
  // 补全默认值
  for (const k of ['favicon_url', 'icp_number', 'police_number']) {
    if (!(k in result)) result[k] = ''
  }
  return result
}

// 批量更新公开设置
export async function updatePublicSettings(data) {
  await getDb()
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
  const keys = ['favicon_url', 'icp_number', 'police_number']
  for (const key of keys) {
    if (key in data) {
      stmt.run([key, data[key]])
    }
  }
  stmt.free()
  saveDb()
}

// --- Profile ---

export async function getProfile() {
  await getDb()
  const result = {}
  const stmt = db.prepare("SELECT key, value FROM profile")
  while (stmt.step()) {
    const row = stmt.getAsObject()
    result[row.key] = row.value
  }
  stmt.free()
  return result
}

export async function updateProfile(data) {
  await getDb()
  const stmt = db.prepare("INSERT OR REPLACE INTO profile (key, value) VALUES (?, ?)")
  for (const [key, value] of Object.entries(data)) {
    stmt.run([key, value])
  }
  stmt.free()
  saveDb()
}

// --- Links ---

export async function getLinks() {
  await getDb()
  const stmt = db.prepare("SELECT id, title, url, description FROM links ORDER BY sort_order ASC, id ASC")
  const links = []
  while (stmt.step()) {
    links.push(stmt.getAsObject())
  }
  stmt.free()
  return links
}

export async function updateLinks(links) {
  await getDb()
  db.run("DELETE FROM links")
  const stmt = db.prepare("INSERT INTO links (title, url, description, sort_order) VALUES (?, ?, ?, ?)")
  links.forEach((link, index) => {
    stmt.run([link.title, link.url, link.description, index + 1])
  })
  stmt.free()
  saveDb()
}
