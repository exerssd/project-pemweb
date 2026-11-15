/* ==========================================================
   orders.js — login pelanggan dan daftar status pesanan
   ========================================================== */

const CUSTOMER_AUTH_API = "../backend/api/auth.php";
const CUSTOMER_ORDERS_API = "../backend/api/order-status.php";

let customerAuthMode = "login";
let customerOrdersLoading = false;
let customerOrdersReloadPending = false;

const ORDER_STATUS_LABELS = {
  pending: { label: "Menunggu diproses", className: "pending" },
  processed: { label: "Sedang diproses", className: "processed" },
  completed: { label: "Selesai", className: "completed" },
  cancelled: { label: "Dibatalkan", className: "cancelled" },
};

function showCustomerAuth(message) {
  $("#orders-loading").hidden = true;
  $("#orders-panel").hidden = true;
  $("#orders-auth").hidden = false;
  $("#orders-auth-message").textContent = message;
}

function showOrdersError(message) {
  $("#orders-message").textContent = message;
  $("#orders-message").classList.add("order-error");
}

function renderCustomerOrders(orders) {
  const list = $("#orders-list");
  if (!orders.length) {
    list.innerHTML = '<p class="order-empty sub">Belum ada pesanan pada akun ini.</p>';
    return;
  }

  list.innerHTML = orders.map((order) => {
    const status = ORDER_STATUS_LABELS[order.status] || {
      label: "Status tidak diketahui",
      className: "",
    };

    return `
      <article class="order-card">
        <div class="order-card-head">
          <div>
            <strong class="order-card-number">${escapeHtml(order.order_number)}</strong>
            <small class="order-card-date">${escapeHtml(order.created_at)}</small>
          </div>
          <span class="order-card-status ${status.className}">${status.label}</span>
        </div>
        <div class="order-card-details">
          <strong>${escapeHtml(order.product_name)} × ${Number(order.quantity)}</strong>
          <span>Username game: ${escapeHtml(order.game_username)}</span>
          <span>Pembayaran: ${escapeHtml(order.payment_method)}</span>
        </div>
        <div class="order-card-total">
          <span>Total</span>
          <strong>${formatRupiah(Number(order.total))}</strong>
        </div>
      </article>`;
  }).join("");
}

async function loadCustomerOrders() {
  if (customerOrdersLoading) {
    customerOrdersReloadPending = true;
    return;
  }
  customerOrdersLoading = true;
  $("#orders-refresh").disabled = true;
  $("#orders-message").classList.remove("order-error");
  $("#orders-message").textContent = "Memuat pesanan…";

  try {
    const response = await fetch(CUSTOMER_ORDERS_API, {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
    const result = await response.json();

    if (response.status === 401 || response.status === 403) {
      showCustomerAuth(response.message || "Masuk dengan akun pelanggan untuk melihat pesanan.");
      return;
    }
    if (!response.ok) throw new Error(result.message || "Pesanan gagal dimuat.");

    $("#orders-loading").hidden = true;
    $("#orders-auth").hidden = true;
    $("#orders-panel").hidden = false;
    $("#orders-message").textContent = `${result.orders.length} pesanan`;
    renderCustomerOrders(result.orders);
  } catch (error) {
    showOrdersError(error.message || "Tidak dapat menghubungi backend.");
  } finally {
    customerOrdersLoading = false;
    $("#orders-refresh").disabled = false;
    if (customerOrdersReloadPending) {
      customerOrdersReloadPending = false;
      loadCustomerOrders();
    }
  }
}

function setCustomerAuthMode(mode) {
  customerAuthMode = mode;
  const isRegister = mode === "register";
  $("#orders-name-wrap").hidden = !isRegister;
  $("#orders-name").required = isRegister;
  $("#orders-password").autocomplete = isRegister ? "new-password" : "current-password";
  $("#orders-auth-submit").textContent = isRegister ? "Buat Akun" : "Masuk";
  $("#orders-auth-toggle").textContent = isRegister ? "Saya sudah punya akun" : "Buat akun baru";
  $("#orders-auth-error").hidden = true;
}

async function submitCustomerAuth(event) {
  event.preventDefault();
  const isRegister = customerAuthMode === "register";
  const payload = {
    action: customerAuthMode,
    email: $("#orders-email").value.trim(),
    password: $("#orders-password").value,
  };
  if (isRegister) payload.name = $("#orders-name").value.trim();

  const submitButton = $("#orders-auth-submit");
  submitButton.disabled = true;
  $("#orders-auth-toggle").disabled = true;
  $("#orders-auth-error").hidden = true;

  try {
    const response = await fetch(CUSTOMER_AUTH_API, {
      method: "POST",
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Autentikasi gagal.");
    if (result.user?.role !== "customer") {
      throw new Error("Gunakan akun pelanggan untuk melihat pesanan.");
    }

    await loadCustomerOrders();
  } catch (error) {
    $("#orders-auth-error").textContent = error.message || "Tidak dapat menghubungi backend.";
    $("#orders-auth-error").hidden = false;
  } finally {
    submitButton.disabled = false;
    $("#orders-auth-toggle").disabled = false;
  }
}

async function logoutCustomer() {
  const response = await fetch(CUSTOMER_AUTH_API, {
    method: "POST",
    credentials: "same-origin",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ action: "logout" }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Tidak dapat keluar.");

  $("#orders-list").replaceChildren();
  $("#orders-email").value = "";
  $("#orders-password").value = "";
  showCustomerAuth("Anda sudah keluar. Masuk untuk melihat pesanan.");
}

async function initCustomerOrders() {
  $("#orders-auth-form").addEventListener("submit", submitCustomerAuth);
  $("#orders-auth-toggle").addEventListener("click", () => {
    setCustomerAuthMode(customerAuthMode === "login" ? "register" : "login");
  });
  $("#orders-refresh").addEventListener("click", loadCustomerOrders);
  document.addEventListener("customer-session-updated", loadCustomerOrders);
  $("#orders-logout").addEventListener("click", async () => {
    $("#orders-message").classList.remove("order-error");
    try {
      await logoutCustomer();
    } catch (error) {
      showOrdersError(error.message || "Tidak dapat menghubungi backend.");
    }
  });

  try {
    const response = await fetch(CUSTOMER_AUTH_API, {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Sesi akun gagal diperiksa.");
    if (result.user?.role === "customer") {
      await loadCustomerOrders();
    } else {
      showCustomerAuth(
        result.user
          ? "Sesi ini bukan akun pelanggan. Masuk dengan akun pelanggan untuk melihat pesanan."
          : "Masuk atau buat akun pelanggan untuk melihat status pesanan."
      );
    }
  } catch (error) {
    showCustomerAuth(error.message || "Sesi akun gagal diperiksa. Coba muat ulang halaman.");
    $("#orders-auth-error").textContent = error.message || "";
    $("#orders-auth-error").hidden = !error.message;
  }
}
