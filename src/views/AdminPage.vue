<template>
  <Transition name="toast">
    <div v-if="toast.show" class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-sm text-sm text-white shadow-lg" style="background:var(--accent);">
      {{ toast.msg }}
    </div>
  </Transition>

  <div class="min-h-screen flex items-center justify-center px-6 py-12">
    <!-- ====== 登录 ====== -->
    <div v-if="!authenticated" class="w-full max-w-[360px]">
      <div class="rounded-sm border px-8 py-10 text-center" style="background:var(--card);border-color:var(--rule);">
        <h1 class="text-xl font-bold tracking-wider mb-2" style="color:var(--ink);">后台管理</h1>
        <p class="text-xs mb-8" style="color:var(--ink-faint);">Admin Panel</p>
        <form @submit.prevent="login" class="flex flex-col gap-4">
          <input v-model="password" type="password" placeholder="管理密码" class="input-field w-full px-4 py-2.5 rounded-sm text-sm text-center placeholder:tracking-wider" />
          <p v-if="loginError" class="text-xs" style="color:#c0392b;">{{ loginError }}</p>
          <button type="submit" class="btn-save w-full py-2.5 rounded-sm text-sm tracking-widest">进入</button>
        </form>
      </div>
    </div>

    <!-- ====== 管理面板 ====== -->
    <div v-else class="w-full max-w-[720px]">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-xl font-bold tracking-wider" style="color:var(--ink);">管理后台</h1>
          <p class="text-[0.6rem] tracking-[0.2em] uppercase mt-1" style="color:var(--ink-faint);">Admin</p>
        </div>
        <button @click="logout" class="text-xs tracking-wider hover:underline" style="color:var(--ink-faint);">退出</button>
      </div>

      <!-- 头像预览 -->
      <section class="rounded-sm border px-6 py-6 mb-4 text-center" style="background:var(--card);border-color:var(--rule);">
        <div class="w-[68px] h-[68px] mx-auto rounded-full overflow-hidden flex items-center justify-center text-2xl border" style="background:#faf7f1;border-color:var(--rule);">
          <img v-if="isImageUrl(profileForm.avatar)" :src="profileForm.avatar" class="w-full h-full object-cover" alt="预览" />
          <span v-else>{{ profileForm.avatar || '🧑‍💻' }}</span>
        </div>
        <p class="text-[0.65rem] mt-2" style="color:var(--ink-faint);">头像预览</p>
      </section>

      <!-- 个人信息 -->
      <section class="rounded-sm border px-6 py-6 mb-4" style="background:var(--card);border-color:var(--rule);">
        <h2 class="text-[0.7rem] tracking-[0.2em] uppercase mb-5 pb-3 border-b" style="color:var(--accent);border-color:var(--rule);">个人信息</h2>
        <div class="grid gap-4">
          <FieldRow label="头像">
            <input v-model="profileForm.avatar" placeholder="图床链接 或 Emoji" class="input-field flex-1 px-3 py-2 rounded-sm text-sm" />
          </FieldRow>
          <FieldRow label="姓名">
            <input v-model="profileForm.name" class="input-field flex-1 px-3 py-2 rounded-sm text-sm" />
          </FieldRow>
          <FieldRow label="简介">
            <textarea v-model="profileForm.bio" rows="2" class="input-field flex-1 px-3 py-2 rounded-sm text-sm resize-none"></textarea>
          </FieldRow>
          <div class="flex justify-end"><button @click="saveProfile" class="btn-save px-5 py-1.5 rounded-sm text-xs tracking-wider">保存</button></div>
        </div>
      </section>

      <!-- 网站设置 -->
      <section class="rounded-sm border px-6 py-6 mb-4" style="background:var(--card);border-color:var(--rule);">
        <h2 class="text-[0.7rem] tracking-[0.2em] uppercase mb-5 pb-3 border-b" style="color:var(--accent);border-color:var(--rule);">网站设置</h2>
        <div class="grid gap-4">
          <FieldRow label="图标"><input v-model="settingsForm.favicon_url" placeholder="https://..." class="input-field flex-1 px-3 py-2 rounded-sm text-sm" /></FieldRow>
          <FieldRow label="ICP"><input v-model="settingsForm.icp_number" placeholder="京ICP备..." class="input-field flex-1 px-3 py-2 rounded-sm text-sm" /></FieldRow>
          <FieldRow label="公安"><input v-model="settingsForm.police_number" placeholder="京公网安备..." class="input-field flex-1 px-3 py-2 rounded-sm text-sm" /></FieldRow>
          <div class="flex justify-end"><button @click="saveSettings" class="btn-save px-5 py-1.5 rounded-sm text-xs tracking-wider">保存</button></div>
        </div>
      </section>

      <!-- 修改密码 -->
      <section class="rounded-sm border px-6 py-6 mb-4" style="background:var(--card);border-color:var(--rule);">
        <h2 class="text-[0.7rem] tracking-[0.2em] uppercase mb-5 pb-3 border-b" style="color:var(--accent);border-color:var(--rule);">修改密码</h2>
        <div class="grid gap-3 max-w-[320px]">
          <input v-model="pwForm.oldPassword" type="password" placeholder="原密码" class="input-field w-full px-3 py-2 rounded-sm text-sm" />
          <input v-model="pwForm.newPassword" type="password" placeholder="新密码（至少4位）" class="input-field w-full px-3 py-2 rounded-sm text-sm" />
          <p v-if="pwMsg" class="text-xs" :style="{color: pwOk ? '#27ae60' : '#c0392b'}">{{ pwMsg }}</p>
          <div><button @click="changePw" class="btn-save px-5 py-1.5 rounded-sm text-xs tracking-wider">修改</button></div>
        </div>
      </section>

      <!-- 链接管理 -->
      <section class="rounded-sm border px-6 py-6 mb-4" style="background:var(--card);border-color:var(--rule);">
        <div class="flex items-center justify-between mb-5 pb-3 border-b" style="border-color:var(--rule);">
          <h2 class="text-[0.7rem] tracking-[0.2em] uppercase" style="color:var(--accent);">子网站链接</h2>
          <button @click="addLink" class="text-xs tracking-wider hover:underline" style="color:var(--ink-faint);">+ 添加</button>
        </div>

        <TransitionGroup name="link" tag="div" class="flex flex-col gap-3">
          <div v-for="(link, index) in links" :key="link.id" class="group rounded-sm border px-4 py-3" style="border-color:var(--rule);background:var(--paper);">
            <div class="flex items-center gap-2">
              <span class="text-[0.6rem] font-mono shrink-0 tracking-[0.06em]" style="color:var(--accent);">编号</span>
              <input v-model="link.callNumber" placeholder="Z 001" class="input-white w-[72px] px-2 py-1.5 rounded-sm text-xs" />
              <input v-model="link.title" placeholder="标题" class="input-white flex-1 px-2 py-1.5 rounded-sm text-xs" />
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button @click="moveLink(index,-1)" :disabled="index===0" class="text-xs disabled:opacity-10 hover:text-black px-1" style="color:var(--ink-faint);">&uarr;</button>
                <button @click="moveLink(index,1)" :disabled="index===links.length-1" class="text-xs disabled:opacity-10 hover:text-black px-1" style="color:var(--ink-faint);">&darr;</button>
                <button @click="removeLink(index)" class="text-xs px-1" style="color:#c0392b;">✕</button>
              </div>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-[0.6rem] shrink-0 tracking-[0.06em]" style="color:var(--ink-faint);">URL</span>
              <input v-model="link.url" placeholder="https://..." class="input-white flex-[2] px-2 py-1.5 rounded-sm text-xs" />
              <span class="text-[0.6rem] shrink-0 tracking-[0.06em]" style="color:var(--ink-faint);">描述</span>
              <input v-model="link.description" placeholder="简述" class="input-white flex-[3] px-2 py-1.5 rounded-sm text-xs" />
            </div>
          </div>
        </TransitionGroup>

        <div class="flex justify-end mt-4"><button @click="saveLinks" class="btn-save px-5 py-1.5 rounded-sm text-xs tracking-wider">保存</button></div>
      </section>

      <p class="text-center mt-8 text-xs"><a href="/" class="tracking-wider hover:underline" style="color:var(--ink-faint);">← 返回主页</a></p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h, defineComponent } from 'vue'

// 复用的表单项组件
const FieldRow = defineComponent({
  props: { label: String },
  setup(props, { slots }) {
    return () => h('div', { class: 'flex items-center gap-3' }, [
      h('label', { class: 'text-xs w-16 shrink-0 tracking-wider', style: { color: 'var(--ink-light)' } }, props.label),
      slots.default?.()
    ])
  }
})

// ===== State =====
const authenticated = ref(false)
const password = ref('')
const loginError = ref('')
const profileForm = reactive({ avatar: '', name: '', bio: '' })
const settingsForm = reactive({ favicon_url: '', icp_number: '', police_number: '' })
const links = ref([])
const pwForm = reactive({ oldPassword: '', newPassword: '' })
const pwMsg = ref('')
const pwOk = ref(false)

const toast = reactive({ show: false, msg: '' })
let toastTimer = null
function showToast(msg) { toast.msg = msg; toast.show = true; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.show = false }, 2000) }

function isImageUrl(val) { return val && (val.startsWith('http://') || val.startsWith('https://')) }

// ===== Auth =====
async function login() {
  try {
    const res = await fetch('/api/auth/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({password:password.value}) })
    const data = await res.json()
    if (data.valid) { authenticated.value=true; loginError.value=''; localStorage.setItem('admin_auth','1'); await loadData() }
    else { loginError.value='密码错误' }
  } catch (e) { loginError.value='服务器错误' }
}

function logout() { authenticated.value=false; localStorage.removeItem('admin_auth') }

// ===== Data =====
async function loadData() {
  try {
    const [pRes, lRes, sRes] = await Promise.all([fetch('/api/profile'), fetch('/api/links'), fetch('/api/settings')])
    if (pRes.ok) Object.assign(profileForm, await pRes.json())
    if (lRes.ok) links.value = await lRes.json()
    if (sRes.ok) {
      const s = await sRes.json()
      Object.assign(settingsForm, s)
      if (s.favicon_url) {
        const favicon = document.getElementById('favicon')
        if (favicon) favicon.href = s.favicon_url
      }
    }
  } catch(e) { console.error(e) }
}

// ===== Save =====
async function saveProfile() {
  await fetch('/api/profile', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(profileForm) })
  showToast('个人信息已保存')
}

async function saveSettings() {
  await fetch('/api/settings', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(settingsForm) })
  const favicon = document.getElementById('favicon')
  if (favicon) favicon.href = settingsForm.favicon_url || "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧑‍💻</text></svg>"
  showToast('网站设置已保存')
}

async function changePw() {
  pwMsg.value=''; pwOk.value=false
  if (!pwForm.newPassword || pwForm.newPassword.length<4) { pwMsg.value='新密码至少4位'; return }
  try {
    const res = await fetch('/api/auth/change-password', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(pwForm) })
    const data = await res.json()
    if (res.ok && data.ok) { pwMsg.value=''; pwOk.value=true; pwForm.oldPassword=''; pwForm.newPassword=''; showToast('密码已修改') }
    else { pwMsg.value=data.error||'修改失败' }
  } catch(e) { pwMsg.value='服务器错误' }
}

async function saveLinks() {
  await fetch('/api/links', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(links.value) })
  showToast('链接已保存')
}

function addLink() { links.value.push({ id:Date.now(), callNumber:'', title:'', url:'', description:'' }) }
function removeLink(index) { links.value.splice(index, 1) }
function moveLink(index, direction) {
  const i = index + direction
  if (i<0 || i>=links.value.length) return
  const item = links.value.splice(index,1)[0]
  links.value.splice(i,0,item)
}

onMounted(() => {
  if (localStorage.getItem('admin_auth')==='1') { authenticated.value=true; loadData() }
})
</script>
