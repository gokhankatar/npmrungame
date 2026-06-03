<template>
  <div class="admin-loading" role="status" aria-live="polite" aria-label="Admin paneli yükleniyor">
    <div class="admin-loading__glow admin-loading__glow--a" aria-hidden="true" />
    <div class="admin-loading__glow admin-loading__glow--b" aria-hidden="true" />

    <div class="admin-loading__card">
      <div class="admin-loading__logo-ring">
        <v-progress-circular indeterminate :size="52" :width="3" color="#69f0ae" />
        <v-icon icon="mdi-shield-lock-outline" size="28" color="#69f0ae" class="admin-loading__logo-icon" />
      </div>

      <p class="admin-loading__brand default-title-letter">npmrungame</p>
      <p class="admin-loading__title default-title-letter">Admin paneli hazırlanıyor</p>
      <p class="admin-loading__sub default-title-letter">Modüller ve stiller yükleniyor…</p>

      <div class="admin-loading__bar" aria-hidden="true">
        <span class="admin-loading__bar-fill" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-loading {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #06080c;
  overflow: hidden;
}

.admin-loading__glow {
  position: absolute;
  width: min(420px, 70vw);
  height: min(420px, 70vw);
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.45;
  pointer-events: none;
}

.admin-loading__glow--a {
  top: 20%;
  left: 15%;
  background: radial-gradient(circle, rgba(105, 240, 174, 0.35) 0%, transparent 70%);
}

.admin-loading__glow--b {
  bottom: 15%;
  right: 12%;
  background: radial-gradient(circle, rgba(67, 160, 71, 0.2) 0%, transparent 70%);
}

.admin-loading__card {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 2rem 2.25rem;
  border-radius: 22px;
  border: 1px solid rgba(105, 240, 174, 0.22);
  background: rgba(10, 14, 18, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);
  min-width: min(320px, 88vw);
}

.admin-loading__logo-ring {
  position: relative;
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-loading__logo-icon {
  position: absolute;
}

.admin-loading__brand {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(105, 240, 174, 0.85);
}

.admin-loading__title {
  margin: 0.5rem 0 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
}

.admin-loading__sub {
  margin: 0.35rem 0 0;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.45);
}

.admin-loading__bar {
  margin-top: 1.35rem;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.admin-loading__bar-fill {
  display: block;
  height: 100%;
  width: 40%;
  border-radius: inherit;
  background: linear-gradient(90deg, transparent, #69f0ae, transparent);
  animation: admin-loading-bar 1.2s ease-in-out infinite;
}

@keyframes admin-loading-bar {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(320%);
  }
}
</style>
