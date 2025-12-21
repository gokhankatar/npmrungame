<template>
  <div class="main-container-loading d-flex justify-center align-center">
    <div class="preloader">
      <span class="rounded-xs" />
      <span class="rounded-xs" />
      <span class="rounded-xs" />
      <span class="rounded-xs" />
      <span class="rounded-xs" />
    </div>
  </div>
</template>

<style scoped>
.main-container-loading {
  background: #000;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}

.preloader {
  display: flex;
  gap: 0.2rem;
}

.preloader span {
  display: block;
  width: 0.3rem;
  height: 0.8rem;
  background: #cfcfcf;
  animation: upDown 1.2s infinite ease-in-out;
}

.preloader span:nth-child(1) {
  animation-delay: 0.1s;
}
.preloader span:nth-child(2) {
  animation-delay: 0.25s;
}
.preloader span:nth-child(3) {
  animation-delay: 0.4s;
}
.preloader span:nth-child(4) {
  animation-delay: 0.55s;
}
.preloader span:nth-child(5) {
  animation-delay: 0.7s;
}

@keyframes upDown {
  0% {
    height: 1rem;
    background: #69f0ae;
  }
  50% {
    height: 1.8rem;
    background: #8c8c8c;
  }
  100% {
    height: 1rem;
    background: #cfcfcf;
  }
}
</style>
