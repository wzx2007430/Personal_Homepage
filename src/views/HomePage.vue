<template>
  <div class="grid-bg fixed inset-0 pointer-events-none"></div>

  <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换亮色模式' : '切换暗色模式'">
    {{ isDark ? '☀️' : '🌙' }}
  </button>

  <div class="relative z-10 min-h-screen flex items-center justify-center px-8 py-16">
    <div class="w-full max-w-[560px]">
      <header class="text-center mb-14">
        <div class="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-white/[0.03]">
          <img v-if="isImageUrl(profile.avatar)" :src="profile.avatar" class="w-full h-full object-cover" alt="avatar" />
          <span v-else class="text-3xl">{{ profile.avatar }}</span>
        </div>
        <h1 class="text-2xl font-medium tracking-wider text-gray-900 dark:text-white">{{ profile.name }}</h1>
        <p class="mt-3 text-sm leading-relaxed text-gray-500 dark:text-white/40 max-w-[340px] mx-auto whitespace-pre-line">{{ profile.bio }}</p>
      </header>

      <nav>
        <a
          v-for="(link, index) in links"
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener"
          class="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4 border-b border-gray-200 dark:border-white/[0.04] first:border-t no-underline text-gray-600 dark:text-white/55 hover:pl-2 transition-all duration-300"
        >
          <span class="text-xs font-mono text-gray-400 dark:text-white/20 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:opacity-60 transition-colors w-6 text-right">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <div>
            <div class="text-[0.95rem] font-medium group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{{ link.title }}</div>
            <div class="text-xs text-gray-500 dark:text-white/30 group-hover:text-gray-600 dark:group-hover:text-white/50 mt-0.5 transition-colors">{{ link.description }}</div>
          </div>
          <span class="opacity-0 group-hover:opacity-100 text-sm text-cyan-600 dark:text-cyan-400 transition-all duration-300">
            &rarr;
          </span>
        </a>
      </nav>

      <p v-if="links.length === 0" class="text-center text-gray-400 dark:text-white/20 text-sm mt-8">
        暂无链接，请前往后台添加
      </p>

      <!-- 页脚 + 备案号 -->
      <footer class="text-center mt-14 text-xs text-gray-400 dark:text-white/[0.18] tracking-wider space-y-1.5">
        <p>&copy; {{ new Date().getFullYear() }}</p>
        <p v-if="settings.icp_number" class="text-[0.7rem] opacity-70">
          <a :href="'https://beian.miit.gov.cn'" target="_blank" rel="noopener" class="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">{{ settings.icp_number }}</a>
        </p>
        <p v-if="settings.police_number" class="text-[0.7rem] opacity-70">
          <a :href="'http://www.beian.gov.cn/portal/registerSystemInfo'" target="_blank" rel="noopener" class="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">{{ settings.police_number }}</a>
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const profile = ref({
  name: '张三',
  avatar: '🧑‍💻',
  bio: '全栈开发者 · 开源爱好者 · 终身学习者\n关注前端技术与数字产品设计'
})

const links = ref([])
const settings = reactive({ icp_number: '', police_number: '' })
const isDark = ref(true)

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

onMounted(async () => {
  const saved = localStorage.getItem('theme')
  applyTheme(saved !== 'light')

  try {
    const [pRes, lRes, sRes] = await Promise.all([
      fetch('/api/profile'),
      fetch('/api/links'),
      fetch('/api/settings')
    ])
    if (pRes.ok) profile.value = await pRes.json()
    if (lRes.ok) links.value = await lRes.json()
    if (sRes.ok) {
      const s = await sRes.json()
      Object.assign(settings, s)
      if (s.favicon_url) setFavicon(s.favicon_url)
    }
  } catch (e) {
    console.error('加载数据失败:', e)
  }
})
</script>
