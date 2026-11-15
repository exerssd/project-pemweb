/* ==========================================================
   data.js — helper kecil & semua data (produk, game, harga)
   ========================================================== */

// Shortcut untuk document.querySelector
const $ = (selector) => document.querySelector(selector);

// Ubah angka jadi format rupiah, contoh: 15000 -> "Rp15.000"
const formatRupiah = (n) => "Rp" + n.toLocaleString("id-ID");

// Produk utama: [nama, ikon, jumlah terjual]
const PRODUCTS = [
  ["Robux 5 Hari", "💎", "52 rb+"],
  ["Roblox Plus", "👑", "24 rb+"],
  ["Giftcard", "🎁", "10 rb+"],
  ["Robux Instant", "⚡", "36 rb+"],
  ["Limited Roblox", "🧢", "4 rb+"],
  ["Robux Via Username", "👤", "9 rb+"],
];

// Index produk di atas yang memakai paket nominal Robux
const ROBUX_PRODUCT_INDEXES = [0, 3, 5];

// Game: [nama, jumlah terjual]
const GAMES = [
  ["Blox Fruit", "18 rb+"],
  ["Fish It", "27 rb+"],
  ["Brookhaven", "1 rb+"],
  ["Blade Ball", "7 rb+"],
  ["Fisch", "9 rb+"],
  ["Evade", "7 rb+"],
  ["Bed Wars", "664"],
  ["Dress To Impress", "1 rb+"],
  ["Steal a Brainrot", "452"],
  ["Sailor Piece", "572"],
  ["The Forge", "1 rb+"],
  ["Blue Lock", "1 rb+"],
  ["Volleyball Legends", "1 rb+"],
  ["King Legacy", "4 rb+"],
  ["Bloxburg", "182"],
  ["99 Nights in the Forest", "1 rb+"],
];

// Paket Robux: [label, harga]. Harga = Rp140 per Robux, dibulatkan ke Rp500.
const ROBUX_PACKAGES = [80, 160, 400, 800, 1700, 4500].map((n) => [
  n + " Robux",
  Math.round((n * 140) / 500) * 500,
]);

// Paket item in-game: [label, harga]
const ITEM_PACKAGES = [
  ["Starter Pack", 15000],
  ["Booster Pack", 35000],
  ["Pro Pack", 75000],
  ["Elite Pack", 150000],
  ["Mega Pack", 300000],
  ["Ultimate Pack", 600000],
];

const PAYMENTS = ["QRIS", "GoPay", "DANA", "OVO", "ShopeePay", "BCA", "BNI", "BRI", "Indomaret", "Alfamart"];

// Data contoh leaderboard (nama palsu)
const LEADERBOARD_NAMES = [
  "Aurora_Z", "NightFury88", "VioletQueen", "RobloxKing_ID", "PixelNinja",
  "LunaBlox", "DarkMatter", "SkyRunner", "CherryPop", "ShadowFox",
];
// Pengali total belanja: harian, mingguan, bulanan
const LEADERBOARD_MULTIPLIER = [1, 7, 30];
