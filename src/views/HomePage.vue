<template>
  <div class="min-h-screen flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-[680px] rounded px-6 py-6" style="background:linear-gradient(180deg, #e8dfd0 0%, #dfd5c2 100%);box-shadow:0 4px 24px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,0.3);">
      <div class="flex items-center gap-2.5 mb-5">
        <div class="w-7 h-2.5 rounded-sm" style="background:linear-gradient(180deg, #c4a96a, #a0844a);box-shadow:0 1px 3px rgba(0,0,0,0.15);"></div>
        <span class="text-[0.6rem] tracking-[0.3em] uppercase" style="color:var(--ink-faint);">个人导航站 · Personal Index</span>
      </div>

      <!-- 加载骨架 -->
      <template v-if="loading">
        <div class="rounded-sm border px-8 py-10 mb-6 text-center skeleton" style="border-color:var(--rule);height:200px;"></div>
        <div v-for="n in 3" :key="n" class="rounded-sm border px-5 py-5 mb-2.5 skeleton" style="border-color:var(--rule);height:60px;"></div>
      </template>

      <!-- 内容 -->
      <template v-else>
        <div class="rounded-sm px-8 py-8 mb-6 text-center border" style="background:var(--card);border-color:var(--rule);box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          <div class="w-[72px] h-[72px] mx-auto mb-4 rounded-full overflow-hidden flex items-center justify-center text-3xl border" style="background:#faf7f1;border-color:var(--rule);">
            <img v-if="isImageUrl(profile.avatar)" :src="profile.avatar" class="w-full h-full object-cover" alt="avatar" />
            <span v-else>{{ profile.avatar }}</span>
          </div>
          <h1 class="text-[1.5rem] font-bold tracking-[0.04em] mb-1.5" style="color:var(--ink);">{{ profile.name }}</h1>
          <p class="text-sm leading-relaxed max-w-[320px] mx-auto whitespace-pre-line" style="color:var(--ink-light);">{{ profile.bio }}</p>
          <div class="flex items-center gap-2 justify-center my-4">
            <div class="flex-1 h-px max-w-[60px]" style="background:var(--rule);"></div>
            <div class="w-[3px] h-[3px] rounded-full" style="background:var(--accent);"></div>
            <div class="flex-1 h-px max-w-[60px]" style="background:var(--rule);"></div>
          </div>
        </div>

        <!-- 链接卡片（CSS hover 替代内联 JS） -->
        <nav class="flex flex-col gap-2.5">
          <a
            v-for="(link, index) in links"
            :key="link.id"
            :href="link.url"
            target="_blank"
            rel="noopener"
            class="link-card rounded-sm px-5 py-3.5 grid gap-4 no-underline"
            style="grid-template-columns:50px 1fr auto;align-items:center;"
          >
            <span class="text-[0.6rem] tracking-[0.1em] font-mono whitespace-nowrap" style="color:var(--accent);">{{ link.callNumber || String(index + 1).padStart(2,'0') }}</span>
            <div>
              <div class="text-[0.9rem] font-semibold tracking-[0.02em]">{{ link.title }}</div>
              <div class="text-xs mt-0.5" style="color:var(--ink-light);">{{ link.description }}</div>
            </div>
            <span class="text-sm" style="color:var(--ink-faint);">→</span>
          </a>
        </nav>

        <p v-if="!loading && links.length === 0" class="text-center text-sm mt-8" style="color:var(--ink-faint);">
          暂无链接，请前往后台添加
        </p>

        <p v-if="error" class="text-center text-xs mt-4" style="color:#c0392b;">加载失败，请刷新页面重试</p>
      </template>

      <!-- 备案 -->
      <div class="text-center mt-10 space-y-1">
        <p v-if="settings.icp_number" class="text-[0.65rem]" style="color:var(--ink-faint);">
          <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener" class="hover:underline">{{ settings.icp_number }}</a>
        </p>
        <p v-if="settings.police_number" class="text-[0.65rem]" style="color:var(--ink-faint);">
          <a href="http://www.beian.gov.cn/portal/registerSystemInfo" target="_blank" rel="noopener" class="hover:underline">{{ settings.police_number }}</a>
        </p>
        <p class="text-[0.65rem] mt-2" style="color:var(--ink-faint);">{{ profile.name }}的个人主页 · {{ new Date().getFullYear() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const profile = ref({ name: '张三', avatar: '🧑‍💻', bio: '' })
const links = ref([])
const settings = reactive({ icp_number: '', police_number: '' })
const loading = ref(true)
const error = ref(false)

function isImageUrl(val) { return val && (val.startsWith('http://') || val.startsWith('https://')) }

onMounted(async () => {
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
      // 动态设置 favicon
      const favicon = document.getElementById('favicon')
      if (favicon && s.favicon_url) favicon.href = s.favicon_url
    }
  } catch (e) {
    console.error('加载数据失败:', e)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>
