<template>
  <div class="min-h-screen flex items-center justify-center px-6 py-12">
    <!-- 卡片目录柜 -->
    <div class="w-full max-w-[680px] rounded px-6 py-6" style="background:linear-gradient(180deg, #e8dfd0 0%, #dfd5c2 100%);box-shadow:0 4px 24px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,0.3);">
      <!-- 抽屉把手 -->
      <div class="flex items-center gap-2.5 mb-5">
        <div class="w-7 h-2.5 rounded-sm" style="background:linear-gradient(180deg, #c4a96a, #a0844a);box-shadow:0 1px 3px rgba(0,0,0,0.15);"></div>
        <span class="text-[0.6rem] tracking-[0.3em] uppercase" style="color:var(--ink-faint);">Catalog Drawer · Personal Index</span>
      </div>

      <!-- 头部卡片 -->
      <div class="rounded-sm px-8 py-8 mb-6 text-center border" style="background:var(--card);border-color:var(--rule);box-shadow:0 1px 3px rgba(0,0,0,0.03);">
        <div class="w-[72px] h-[72px] mx-auto mb-4 rounded-full overflow-hidden flex items-center justify-center text-3xl border" style="background:#faf7f1;border-color:var(--rule);">
          <img v-if="isImageUrl(profile.avatar)" :src="profile.avatar" class="w-full h-full object-cover" alt="avatar" />
          <span v-else>{{ profile.avatar }}</span>
        </div>
        <h1 class="text-[1.5rem] font-bold tracking-[0.04em] mb-1.5" style="color:var(--ink);">{{ profile.name }}</h1>
        <p class="text-sm leading-relaxed max-w-[320px] mx-auto whitespace-pre-line" style="color:var(--ink-light);">{{ profile.bio }}</p>

        <!-- 装饰分隔线 -->
        <div class="flex items-center gap-2 justify-center my-4">
          <div class="flex-1 h-px max-w-[60px]" style="background:var(--rule);"></div>
          <div class="w-[3px] h-[3px] rounded-full" style="background:var(--accent);"></div>
          <div class="flex-1 h-px max-w-[60px]" style="background:var(--rule);"></div>
        </div>
      </div>

      <!-- 目录卡片列表 -->
      <nav class="flex flex-col gap-2.5">
        <a
          v-for="link in links"
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener"
          class="group rounded-sm px-5 py-3.5 border grid gap-4 no-underline transition-all duration-300 hover:translate-x-1 hover:-rotate-[0.5deg]"
          style="background:var(--card);border-color:var(--rule);color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,0.02);grid-template-columns:50px 1fr auto;align-items:center;"
          @mouseenter="e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.boxShadow='2px 3px 8px rgba(0,0,0,0.06)'; }"
          @mouseleave="e => { e.currentTarget.style.borderColor='var(--rule)'; e.currentTarget.style.boxShadow='0 1px 2px rgba(0,0,0,0.02)'; }"
        >
          <span class="text-[0.6rem] tracking-[0.1em] font-mono whitespace-nowrap" style="color:var(--accent);">{{ link.callNumber || 'Z ' + String(links.indexOf(link) + 1).padStart(3,'0') }}</span>
          <div>
            <div class="text-[0.9rem] font-semibold tracking-[0.02em]">{{ link.title }}</div>
            <div class="text-xs mt-0.5" style="color:var(--ink-light);">{{ link.description }}</div>
          </div>
          <span class="text-sm transition-colors group-hover:opacity-100" style="color:var(--ink-faint);">→</span>
        </a>
      </nav>

      <p v-if="links.length === 0" class="text-center text-sm mt-8" style="color:var(--ink-faint);">
        目录为空，请前往后台添加卡片
      </p>

      <!-- 备案号 -->
      <div class="text-center mt-10 space-y-1">
        <p v-if="settings.icp_number" class="text-[0.65rem]" style="color:var(--ink-faint);">
          <a :href="'https://beian.miit.gov.cn'" target="_blank" rel="noopener" class="hover:underline">{{ settings.icp_number }}</a>
        </p>
        <p v-if="settings.police_number" class="text-[0.65rem]" style="color:var(--ink-faint);">
          <a :href="'http://www.beian.gov.cn/portal/registerSystemInfo'" target="_blank" rel="noopener" class="hover:underline">{{ settings.police_number }}</a>
        </p>
        <p class="text-[0.65rem] mt-2" style="color:var(--ink-faint);">Library of {{ profile.name }} · Est. {{ new Date().getFullYear() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const profile = ref({ name: '张三', avatar: '🧑‍💻', bio: '全栈开发者 · 开源爱好者 · 终身学习者\n关注前端技术与数字产品设计' })
const links = ref([])
const settings = reactive({ icp_number: '', police_number: '' })

function isImageUrl(val) { return val && (val.startsWith('http://') || val.startsWith('https://')) }

function setFavicon(url) {
  const link = document.getElementById('favicon')
  if (link) link.href = url || "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧑‍💻</text></svg>"
}

onMounted(async () => {
  try {
    const [pRes, lRes, sRes] = await Promise.all([fetch('/api/profile'), fetch('/api/links'), fetch('/api/settings')])
    if (pRes.ok) profile.value = await pRes.json()
    if (lRes.ok) links.value = await lRes.json()
    if (sRes.ok) {
      const s = await sRes.json()
      Object.assign(settings, s)
      if (s.favicon_url) setFavicon(s.favicon_url)
    }
  } catch (e) { console.error(e) }
})
</script>
