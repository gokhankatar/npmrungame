/** Admin panel shell: CSS/modüller hazır olana kadar minimum süre + load event */
export const useAdminShellReady = () => {
  const shellReady = ref(false);

  const waitForAdminShell = () =>
    new Promise<void>((resolve) => {
      const minMs = 480;
      const started = Date.now();

      const finish = () => {
        const left = Math.max(0, minMs - (Date.now() - started));
        setTimeout(() => {
          shellReady.value = true;
          resolve();
        }, left);
      };

      const afterPaint = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(finish);
        });
      };

      if (import.meta.client) {
        if (document.readyState === "complete") {
          afterPaint();
        } else {
          window.addEventListener("load", afterPaint, { once: true });
        }
      } else {
        shellReady.value = true;
        resolve();
      }
    });

  const resetShell = () => {
    shellReady.value = false;
  };

  return { shellReady, waitForAdminShell, resetShell };
};
