<template>
  <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换亮色模式' : '切换暗色模式'">
    {{ isDark ? '☀️' : '🌙' }}
  </button>

  <div class="grid-bg fixed inset-0 pointer-events-none"></div>

  <Transition name="link">
    <div v-if="toast.show" class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-full text-sm bg-emerald-500/90 text-white shadow-lg backdrop-blur-sm">
      {{ toast.msg }}
    </div>
  </Transition>

  <div class="relative z-10 min-h-screen flex items-center justify-center px-8 py-16">
    <div v-if="!authenticated" class="w-full max-w-[380px]">
      <h1 class="text-center text-xl font-medium text-gray-900 dark:text-white mb-10 tracking-wider">后台管理</h1>
      <form @submit.prevent="login" class="flex flex-col gap-4">
        <input
          v-model="password"
          type="password"
          placeholder="请输入管理密码"
          class="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 placeholder:text-gray-400 dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-white/70 dark:placeholder:text-white/20 focus:outline-none focus:border-cyan-400/40 dark:focus:border-cyan-400/30 transition-colors text-sm"
        />
        <p v-if="loginError" class="text-red-500 dark:text-red-400/70 text-xs">{{ loginError }}</p>
        <button
          type="submit"
          class="w-full py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-600 dark:bg-white/[0.06] dark:border-white/[0.1] dark:text-white/60 dark:hover:bg-cyan-400/10 dark:hover:border-cyan-400/20 dark:hover:text-cyan-400 transition-all text-sm tracking-wider"
        >
          登录
        </button>
      </form>
    </div>

    <div v-else class="w-full max-w-[640px]">
      <div class="flex items-center justify-between mb-10">
        <h1 class="text-xl font-medium text-gray-900 dark:text-white tracking-wider">管理后台</h1>
        <button @click="logout" class="text-xs text-gray-500 dark:text-white/25 hover:text-gray-700 dark:hover:text-white/50 transition-colors">退出</button>
      </div>

      <section class="mb-6 p-6 bg-gray-50 border border-gray-200 dark:bg-white/[0.02] dark:border-white/[0.05] rounded-xl text-center">
        <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-white/[0.03]">
          <img v-if="isImageUrl(profileForm.avatar)" :src="profileForm.avatar" class="w-full h-full object-cover" alt="预览" />
          <span v-else class="text-3xl">{{ profileForm.avatar || '🧑‍💻' }}</span>
        </div>
        <p class="text-xs text-gray-500 dark:text-white/25 mt-3">头像预览</p>
      </section>

      <section class="mb-6 p-6 bg-gray-50 border border-gray-200 dark:bg-white/[0.02] dark:border-white/[0.05] rounded-xl">
        <h2 class="text-sm text-gray-600 dark:text-white/40 mb-4 tracking-wider">个人信息</h2>
        <div class="grid gap-3">
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-600 dark:text-white/30 w-16 shrink-0">头像链接</label>
            <input v-model="profileForm.avatar" placeholder="图床链接 或 Emoji（如 🧑‍💻）" class="flex-1 px-3 py-2 bg-white border border-gray-200 dark:bg-white/[0.04] dark:border-white/[0.06] rounded text-gray-700 dark:text-white/60 text-sm focus:outline-none focus:border-cyan-400/40 dark:focus:border-cyan-400/20 placeholder:text-gray-400 dark:placeholder:text-white/20" />
          </div>
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-600 dark:text-white/30 w-16 shrink-0">姓名</label>
            <input v-model="profileForm.name" class="flex-1 px-3 py-2 bg-white border border-gray-200 dark:bg-white/[0.04] dark:border-white/[0.06] rounded text-gray-700 dark:text-white/60 text-sm focus:outline-none focus:border-cyan-400/40 dark:focus:border-cyan-400/20" />
          </div>
          <div class="flex items-start gap-3">
            <label class="text-xs text-gray-600 dark:text-white/30 w-16 shrink-0 pt-2">简介</label>
            <textarea v-model="profileForm.bio" rows="2" class="flex-1 px-3 py-2 bg-white border border-gray-200 dark:bg-white/[0.04] dark:border-white/[0.06] rounded text-gray-700 dark:text-white/60 text-sm focus:outline-none focus:border-cyan-400/40 dark:focus:border-cyan-400/20 resize-none"></textarea>
          </div>
          <div class="flex justify-end">
            <button @click="saveProfile" class="px-4 py-1.5 text-xs bg-cyan-50 border border-cyan-200 text-cyan-600 rounded hover:bg-cyan-100 dark:bg-cyan-400/10 dark:border-cyan-400/20 dark:text-cyan-400 dark:hover:bg-cyan-400/20 transition-colors">保存</button>
          </div>
        </div>
      </section>

      <section class="mb-6 p-6 bg-gray-50 border border-gray-200 dark:bg-white/[0.02] dark:border-white/[0.05] rounded-xl">
        <h2 class="text-sm text-gray-600 dark:text-white/40 mb-4 tracking-wider">网站设置</h2>
        <div class="grid gap-3">
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-600 dark:text-white/30 w-16 shrink-0">网站图标</label>
            <input v-model="settingsForm.favicon_url" placeholder="https://example.com/icon.png" class="flex-1 px-3 py-2 bg-white border border-gray-200 dark:bg-white/[0.04] dark:border-white/[0.06] rounded text-gray-700 dark:text-white/60 text-sm focus:outline-none focus:border-cyan-400/40 dark:focus:border-cyan-400/20 placeholder:text-gray-400 dark:placeholder:text-white/20" />
          </div>
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-600 dark:text-white/30 w-16 shrink-0">ICP 备案</label>
            <input v-model="settingsForm.icp_number" placeholder="京ICP备2024000000号" class="flex-1 px-3 py-2 bg-white border border-gray-200 dark:bg-white/[0.04] dark:border-white/[0.06] rounded text-gray-700 dark:text-white/60 text-sm focus:outline-none focus:border-cyan-400/40 dark:focus:border-cyan-400/20 placeholder:text-gray-400 dark:placeholder:text-white/20" />
          </div>
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-600 dark:text-white/30 w-16 shrink-0">公安备案</label>
            <input v-model="settingsForm.police_number" placeholder="京公网安备 11010000000000号" class="flex-1 px-3 py-2 bg-white border border-gray-200 dark:bg-white/[0.04] dark:border-white/[0.06] rounded text-gray-700 dark:text-white/60 text-sm focus:outline-none focus:border-cyan-400/40 dark:focus:border-cyan-400/20 placeholder:text-gray-400 dark:placeholder:text-white/20" />
          </div>
          <p class="text-xs text-gray-500 dark:text-white/20 ml-[76px]">备案号留空则不显示，已内置跳转到官方查询链接</p>
          <div class="flex justify-end">
            <button @click="saveSettings" class="px-4 py-1.5 text-xs bg-cyan-50 border border-cyan-200 text-cyan-600 rounded hover:bg-cyan-100 dark:bg-cyan-400/10 dark:border-cyan-400/20 dark:text-cyan-400 dark:hover:bg-cyan-400/20 transition-colors">保存</button>
          </div>
        </div>
      </section>

      <section class="mb-6 p-6 bg-gray-50 border border-gray-200 dark:bg-white/[0.02] dark:border-white/[0.05] rounded-xl">
        <h2 class="text-sm text-gray-600 dark:text-white/40 mb-4 tracking-wider">修改密码</h2>
        <div class="grid gap-3 max-w-[360px]">
          <input v-model="pwForm.oldPassword" type="password" placeholder="原密码" class="w-full px-3 py-2 bg-white border border-gray-200 dark:bg-white/[0.04] dark:border-white/[0.06] rounded text-gray-700 dark:text-white/60 text-sm focus:outline-none focus:border-cyan-400/40 dark:focus:border-cyan-400/20 placeholder:text-gray-400 dark:placeholder:text-white/20" />
          <input v-model="pwForm.newPassword" type="password" placeholder="新密码（至少4位）" class="w-full px-3 py-2 bg-white border border-gray-200 dark:bg-white/[0.04] dark:border-white/[0.06] rounded text-gray-700 dark:text-white/60 text-sm focus:outline-none focus:border-cyan-400/40 dark:focus:border-cyan-400/20 placeholder:text-gray-400 dark:placeholder:text-white/20" />
          <p v-if="pwMsg" :class="['text-xs', pwOk ? 'text-emerald-500' : 'text-red-500 dark:text-red-400/70']">{{ pwMsg }}</p>
          <div>
            <button @click="changePw" class="px-4 py-1.5 text-xs bg-cyan-50 border border-cyan-200 text-cyan-600 rounded hover:bg-cyan-100 dark:bg-cyan-400/10 dark:border-cyan-400/20 dark:text-cyan-400 dark:hover:bg-cyan-400/20 transition-colors">修改密码</button>
          </div>
        </div>
      </section>

      <section class="p-6 bg-gray-50 border border-gray-200 dark:bg-white/[0.02] dark:border-white/[0.05] rounded-xl">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm text-gray-600 dark:text-white/40 tracking-wider">子网站链接</h2>
          <button @click="addLink" class="text-xs text-gray-500 dark:text-white/30 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">+ 添加</button>
        </div>

        <TransitionGroup name="link" tag="div" class="flex flex-col">
          <div
            v-for="(link, index) in links"
            :key="link.id"
            class="group flex items-center gap-3 py-3 border-b border-gray-100 dark:border-white/[0.03]"
          >
            <span class="text-xs font-mono text-gray-400 dark:text-white/15 w-5 text-right">{{ String(index + 1).padStart(2, '0') }}</span>
            <input v-model="link.title" placeholder="标题" class="flex-1 px-2 py-1.5 bg-white border border-gray-200 dark:bg-white/[0.03] dark:border-white/[0.05] rounded text-gray-700 dark:text-white/50 text-sm focus:outline-none focus:border-cyan-400/40 dark:focus:border-cyan-400/20" />
            <input v-model="link.url" placeholder="链接" class="flex-1 px-2 py-1.5 bg-white border border-gray-200 dark:bg-white/[0.03] dark:border-white/[0.05] rounded text-gray-700 dark:text-white/50 text-sm focus:outline-none focus:border-cyan-400/40 dark:focus:border-cyan-400/20" />
            <input v-model="link.description" placeholder="描述" class="flex-[0.8] px-2 py-1.5 bg-white border border-gray-200 dark:bg-white/[0.03] dark:border-white/[0.05] rounded text-gray-500 dark:text-white/40 text-sm focus:outline-none focus:border-cyan-400/40 dark:focus:border-cyan-400/20" />
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="moveLink(index, -1)" :disabled="index === 0" class="text-gray-400 dark:text-white/20 hover:text-gray-700 dark:hover:text-white/50 disabled:opacity-10 text-xs">&uarr;</button>
              <button @click="moveLink(index, 1)" :disabled="index === links.length - 1" class="text-gray-400 dark:text-white/20 hover:text-gray-700 dark:hover:text-white/50 disabled:opacity-10 text-xs">&darr;</button>
              <button @click="removeLink(index)" class="text-red-400 dark:text-red-400/30 hover:text-red-600 dark:hover:text-red-400/70 text-xs">✕</button>
            </div>
          </div>
        </TransitionGroup>

        <div class="flex justify-end mt-4">
          <button @click="saveLinks" class="px-4 py-1.5 text-xs bg-cyan-50 border border-cyan-200 text-cyan-600 rounded hover:bg-cyan-100 dark:bg-cyan-400/10 dark:border-cyan-400/20 dark:text-cyan-400 dark:hover:bg-cyan-400/20 transition-colors">保存链接</button>
        </div>
      </section>

      <p class="text-center mt-8 text-xs text-gray-400 dark:text-white/10">
        <a href="/" class="hover:text-gray-600 dark:hover:text-white/30 transition-colors">← 返回主页</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const authenticated = ref(false)
const password = ref('')
const loginError = ref('')

const profileForm = reactive({ avatar: '', name: '', bio: '' })
const settingsForm = reactive({ favicon_url: '', icp_number: '', police_number: '' })
const links = ref([])

const pwForm = reactive({ oldPassword: '', newPassword: '' })
const pwMsg = ref('')
const pwOk = ref(false)

const isDark = ref(true)

const toast = reactive({ show: false, msg: '' })
let toastTimer = null
function showToast(msg) {
  toast.msg = msg
  toast.show = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.show = false }, 2000)
}

function isImageUrl(val) {
  return val && (val.startsWith('http://') || val.startsWith('https://'))
}

function applyTheme(dark) {
  isDark.value = dark
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

function toggleTheme() {
  applyTheme(!isDark.value)
}

function setFavicon(url) {
  const link = document.getElementById('favicon')
  if (link) {
    link.href = url || "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧑‍💻</text></svg>"
  }
}

async function login() {
  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value })
    })
    const data = await res.json()
    if (data.valid) {
      authenticated.value = true
      loginError.value = ''
      localStorage.setItem('admin_auth', '1')
      await loadData()
    } else {
      loginError.value = '密码错误'
    }
  } catch (e) {
    loginError.value = '服务器错误'
  }
}

function logout() {
  authenticated.value = false
  localStorage.removeItem('admin_auth')
}

async function loadData() {
  try {
    const [pRes, lRes, sRes] = await Promise.all([
      fetch('/api/profile'),
      fetch('/api/links'),
      fetch('/api/settings')
    ])
    if (pRes.ok) Object.assign(profileForm, await pRes.json())
    if (lRes.ok) links.value = await lRes.json()
    if (sRes.ok) {
      const s = await sRes.json()
      Object.assign(settingsForm, s)
      if (s.favicon_url) setFavicon(s.favicon_url)
    }
  } catch (e) {
    console.error('加载失败:', e)
  }
}

async function saveProfile() {
  await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileForm) })
  showToast('个人信息已保存')
}

async function saveSettings() {
  await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settingsForm) })
  setFavicon(settingsForm.favicon_url)
  showToast('网站设置已保存')
}

async function changePw() {
  pwMsg.value = ''
  pwOk.value = false
  if (!pwForm.newPassword || pwForm.newPassword.length < 4) { pwMsg.value = '新密码至少4位'; return }
  try {
    const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pwForm) })
    const data = await res.json()
    if (res.ok && data.ok) { pwMsg.value = ''; pwOk.value = true; pwForm.oldPassword = ''; pwForm.newPassword = ''; showToast('密码修改成功') }
    else { pwMsg.value = data.error || '修改失败' }
  } catch (e) { pwMsg.value = '服务器错误' }
}

async function saveLinks() {
  await fetch('/api/links', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(links.value) })
  showToast('链接已保存')
}

function addLink() { links.value.push({ id: Date.now(), title: '', url: '', description: '' }) }
function removeLink(index) { links.value.splice(index, 1) }
function moveLink(index, direction) {
  const i = index + direction
  if (i < 0 || i >= links.value.length) return
  const item = links.value.splice(index, 1)[0]
  links.value.splice(i, 0, item)
}

onMounted(() => {
  applyTheme(localStorage.getItem('theme') !== 'light')
  if (localStorage.getItem('admin_auth') === '1') { authenticated.value = true; loadData() }
})
</script>
