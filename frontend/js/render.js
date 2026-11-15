/* ==========================================================
   render.js — menampilkan produk, game, leaderboard, pembayaran
   ========================================================== */

function renderStaticProducts() {
  $("#gp").innerHTML = PRODUCTS.map(([name, icon, sold], i) => `
    <button class="card" data-o="p${i}">
      <span class="tag">FLASH SALE</span>
      <div class="art">${icon}</div>
      <h3>${name}</h3>
      <span class="ins">⚡ PROSES INSTAN</span>
      <div class="meta"><span>⭐ 5,0</span><span>${sold} terjual</span></div>
    </button>`).join("");
}

// Product data is loaded from the backend so admin changes appear here.
let catalogProducts = [];

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value ?? "";
  return element.innerHTML;
}

function renderProducts() {
  const grid = $("#gp");

  if (!catalogProducts.length) {
    grid.innerHTML = '<p class="sub">Belum ada produk Robux yang tersedia.</p>';
    return;
  }

  grid.innerHTML = catalogProducts.map((product) => `
    <button class="card" data-catalog-id="${product.id}">
      <span class="tag">ROBUX</span>
      <div class="art">💎</div>
      <h3>${escapeHtml(product.name)}</h3>
      <span class="ins">⚡ PROSES INSTAN</span>
      <div class="meta"><span>Mulai dari</span><span>${formatRupiah(Number(product.price))}</span></div>
    </button>`).join("");
}

async function loadProducts() {
  const grid = $("#gp");
  grid.innerHTML = '<p class="sub">Memuat produk Robux…</p>';

  try {
    const response = await fetch("../backend/api/products.php", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Catalog request failed");
    const data = await response.json();
    catalogProducts = Array.isArray(data.products) ? data.products : [];
    renderProducts();
  } catch (error) {
    grid.innerHTML = '<p class="sub">Produk belum dapat dimuat. Coba muat ulang halaman.</p>';
  }
}

// Dua huruf awal nama game, dipakai sebagai "gambar" kartu
function gameInitials(name) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function renderGames(keyword = "") {
  const html = GAMES.map(([name, sold], i) => {
    if (!name.toLowerCase().includes(keyword)) return "";
    const bg = `linear-gradient(135deg, hsl(${262 + i * 6} 78% 52%), hsl(${272 + i * 4} 70% 24%))`;
    return `
    <button class="card" data-o="g${i}">
      <div class="art" style="background:${bg}">${gameInitials(name)}</div>
      <h3>${name}</h3>
      <span class="ins">⚡ PROSES INSTAN</span>
      <div class="meta"><span>⭐ 4,9</span><span>${sold} terjual</span></div>
    </button>`;
  }).join("");

  $("#gg").innerHTML = html || '<p class="sub">Game tidak ditemukan.</p>';
}

// tab: 0 = harian, 1 = mingguan, 2 = bulanan
function renderLeaderboard(tab = 0) {
  $("#lb").innerHTML = [0, 1, 2, 3, 4].map((i) => {
    const name = LEADERBOARD_NAMES[(i + tab * 3) % LEADERBOARD_NAMES.length];
    const total = (900 - i * 130) * LEADERBOARD_MULTIPLIER[tab] * 1000;
    return `<div class="row"><span class="rk">${i + 1}</span><b>${name}</b><em>${formatRupiah(total)}</em></div>`;
  }).join("");
}

function renderPayments() {
  $("#py").innerHTML = PAYMENTS.map((p) => `<span>${p}</span>`).join("");
}

// Event: kolom cari game & tab leaderboard
function initFilters() {
  $("#q").addEventListener("input", (e) => renderGames(e.target.value.toLowerCase().trim()));

  $("#tb").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    [...$("#tb").children].forEach((b) => b.classList.toggle("on", b === btn));
    renderLeaderboard(+btn.dataset.t);
  });
}
