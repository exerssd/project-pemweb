/* ==========================================================
   main.js — countdown, ganti tema, dan inisialisasi halaman
   ========================================================== */

// Countdown flash sale: berakhir tiap tengah malam (waktu lokal)
function startCountdown() {
  const pad = (v) => String(v).padStart(2, "0");

  const tick = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const diff = Math.max(0, end - now);

    $("#h").textContent = pad(Math.floor(diff / 36e5));
    $("#m").textContent = pad(Math.floor(diff / 6e4) % 60);
    $("#s").textContent = pad(Math.floor(diff / 1e3) % 60);
  };

  tick();
  setInterval(tick, 1000);
}

// Tombol tema terang/gelap
function initThemeToggle() {
  const root = document.documentElement;
  $("#th").addEventListener("click", () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
  });
}

// ===== Jalankan semuanya =====
loadProducts();
renderGames();
renderLeaderboard();
renderPayments();
initFilters();
initModal();
initCustomerOrders();
startCountdown();
initThemeToggle();
