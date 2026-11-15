/* ==========================================================
   modal.js — popup top up dan pembuatan pesanan
   ========================================================== */

let currentPackages = ROBUX_PACKAGES;
let selectedPackage = null;
let selectedPayment = null;
let currentCatalogProduct = null;
let isSubmitting = false;

const ORDER_API = "../backend/api/order-create.php";
const AUTH_API = "../backend/api/auth.php";

// Update total bayar & status tombol "Bayar Sekarang"
function updateSummary() {
  $("#tt").textContent =
    selectedPackage == null ? "Rp0" : formatRupiah(currentPackages[selectedPackage][1]);

  const usernameValid = $("#un").value.trim().length >= 3;
  $("#go").disabled = !(selectedPackage != null && selectedPayment && usernameValid) || isSubmitting;
}

function clearOrderMessages() {
  $("#order-error").hidden = true;
  $("#customer-auth").hidden = true;
  $("#auth-error").hidden = true;
}

function showOrderError(message) {
  $("#order-error").textContent = message;
  $("#order-error").hidden = false;
}

function closeModal() {
  $("#ov").classList.remove("on");
}

function openCatalogProduct(product) {
  currentCatalogProduct = product;
  currentPackages = [[product.name, Number(product.price)]];
  selectedPackage = 0;
  selectedPayment = null;

  $("#mt").textContent = "Top Up " + product.name;
  $("#ms").textContent = product.description || "Isi username Roblox lalu pilih metode pembayaran.";
  $("#po").innerHTML = `<button class="opt on" data-p="0">${escapeHtml(product.name)}<small>${formatRupiah(Number(product.price))}</small></button>`;
  $("#pm").innerHTML = PAYMENTS.map((p) => `<button class="opt" data-m="${p}">${p}</button>`).join("");
  $("#un").value = "";
  clearOrderMessages();
  $("#fm").hidden = false;
  $("#ok").hidden = true;
  $("#ov").classList.add("on");
  updateSummary();
}

// key: "p0" = produk index 0, "g3" = game index 3
function openModal(key) {
  if (key === "p0" && catalogProducts.length) {
    openCatalogProduct(catalogProducts[0]);
    return;
  }
  if (key === "p0") {
    showOrderError("Produk belum berhasil dimuat. Silakan muat ulang halaman lalu coba lagi.");
    $("#fm").hidden = false;
    $("#ok").hidden = true;
    $("#ov").classList.add("on");
    return;
  }

  currentCatalogProduct = null;
  const isGame = key[0] === "g";
  const index = +key.slice(1);
  const name = (isGame ? GAMES[index] : PRODUCTS[index])[0];

  currentPackages = !isGame && ROBUX_PRODUCT_INDEXES.includes(index) ? ROBUX_PACKAGES : ITEM_PACKAGES;
  selectedPackage = selectedPayment = null;

  $("#mt").textContent = "Top Up " + name;
  $("#ms").textContent = isGame
    ? "Item dan mata uang in-game · proses instan"
    : "Pilih nominal, isi username, selesai dalam hitungan menit";

  $("#po").innerHTML = currentPackages
    .map(([label, price], j) => `<button class="opt" data-p="${j}">${label}<small>${formatRupiah(price)}</small></button>`)
    .join("");
  $("#pm").innerHTML = PAYMENTS.map((p) => `<button class="opt" data-m="${p}">${p}</button>`).join("");

  $("#un").value = "";
  clearOrderMessages();
  $("#fm").hidden = false;
  $("#ok").hidden = true;
  $("#ov").classList.add("on");
  updateSummary();
}

async function submitOrder() {
  if (!currentCatalogProduct) {
    showOrderError("Produk ini belum tersedia di katalog backend sehingga belum dapat dipesan.");
    return;
  }
  if (selectedPackage == null || !selectedPayment) return;

  clearOrderMessages();
  isSubmitting = true;
  updateSummary();

  try {
    const response = await fetch(ORDER_API, {
      method: "POST",
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: Number(currentCatalogProduct.id),
        quantity: 1,
        game_username: $("#un").value.trim(),
        payment_method: selectedPayment,
      }),
    });
    const result = await response.json();

    if (response.status === 401) {
      $("#customer-auth").hidden = false;
      $("#auth-error").hidden = true;
      $("#auth-message").textContent = result.message || "Silakan masuk atau buat akun pelanggan untuk melanjutkan pesanan.";
      return;
    }
    if (response.status === 403) {
      $("#customer-auth").hidden = false;
      $("#auth-error").hidden = true;
      $("#auth-message").textContent = "Sesi ini bukan akun pelanggan. Masuk dengan akun pelanggan atau buat akun baru untuk memesan.";
      return;
    }
    if (!response.ok) throw new Error(result.message || "Pesanan gagal dibuat.");

    $("#fm").hidden = true;
    $("#ok").hidden = false;
    $("#oi").textContent =
      `Pesanan ${result.order_number} berhasil dibuat · ${formatRupiah(Number(result.total))}.`;
    document.dispatchEvent(new Event("customer-session-updated"));
  } catch (error) {
    showOrderError(error.message || "Tidak dapat menghubungi backend. Periksa koneksi lalu coba lagi.");
  } finally {
    isSubmitting = false;
    updateSummary();
  }
}

async function authenticateCustomer(action) {
  const isRegister = action === "register";
  const payload = {
    action,
    email: $("#auth-email").value.trim(),
    password: $("#auth-password").value,
  };
  if (isRegister) payload.name = $("#auth-name").value.trim();

  $("#auth-error").hidden = true;
  $("#auth-login").disabled = true;
  $("#auth-register").disabled = true;

  try {
    const response = await fetch(AUTH_API, {
      method: "POST",
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Autentikasi gagal.");
    if (result.user?.role !== "customer") {
      throw new Error("Gunakan akun pelanggan untuk membuat pesanan.");
    }

    document.dispatchEvent(new Event("customer-session-updated"));
    $("#customer-auth").hidden = true;
    await submitOrder();
  } catch (error) {
    $("#auth-error").textContent = error.message || "Tidak dapat menghubungi backend.";
    $("#auth-error").hidden = false;
  } finally {
    $("#auth-login").disabled = false;
    $("#auth-register").disabled = false;
  }
}

function initModal() {
  // Buka popup dari tombol/kartu mana pun yang punya data-o
  document.addEventListener("click", (e) => {
    const catalogTrigger = e.target.closest("[data-catalog-id]");
    if (catalogTrigger) {
      const product = catalogProducts.find((item) => String(item.id) === catalogTrigger.dataset.catalogId);
      if (product) openCatalogProduct(product);
      return;
    }

    const trigger = e.target.closest("[data-o]");
    if (trigger) openModal(trigger.dataset.o);
  });

  // Klik di dalam popup: tutup (area gelap) atau pilih nominal/pembayaran
  $("#ov").addEventListener("click", (e) => {
    if (e.target.id === "ov") {
      if ($("#customer-auth").hidden) closeModal();
      return;
    }

    const btn = e.target.closest("[data-p],[data-m]");
    if (!btn) return;

    btn.parentNode.querySelectorAll(".opt").forEach((x) => x.classList.remove("on"));
    btn.classList.add("on");

    if (btn.dataset.p != null) selectedPackage = +btn.dataset.p;
    else selectedPayment = btn.dataset.m;
    updateSummary();
  });

  $("#un").addEventListener("input", updateSummary);
  $("#cl").addEventListener("click", closeModal);
  $("#ok2").addEventListener("click", closeModal);
  $("#go").addEventListener("click", submitOrder);
  $("#auth-login").addEventListener("click", () => authenticateCustomer("login"));
  $("#auth-register").addEventListener("click", () => authenticateCustomer("register"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
}
