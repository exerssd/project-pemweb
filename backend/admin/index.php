<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
$admin = require_admin_page();
$pdo = db();
$counts = ['products' => (int) $pdo->query('SELECT COUNT(*) FROM products WHERE is_active=1')->fetchColumn(), 'orders' => (int) $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn(), 'pending' => (int) $pdo->query("SELECT COUNT(*) FROM orders WHERE status='pending'")->fetchColumn()];
$orders = $pdo->query('SELECT order_number,product_name,total,status,created_at FROM orders ORDER BY id DESC LIMIT 5')->fetchAll();
?>
<!doctype html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dashboard - VioletStore</title>
    <link rel="stylesheet" href="admin.css">
</head>

<body>
    <header class="topbar">
        <div class="shell"><a class="brand" href="index.php">VIOLET<span>STORE</span></a>
            <nav class="nav"><a class="active" href="index.php">Dashboard</a><a href="products.php">Produk</a><a
                    href="orders.php">Pesanan</a><a class="logout" href="logout.php">Keluar</a></nav>
        </div>
    </header>
    <main class="shell page">
        <div class="page-head">
            <div>
                <p class="eyebrow">Ringkasan toko</p>
                <h1>Selamat datang, <?= e($admin['name']) ?></h1>
                <p class="subtitle">Pantau aktivitas VioletStore dari satu halaman.</p>
            </div><a class="button" href="products.php">Kelola produk</a>
        </div>
        <section class="stat-grid">
            <article class="stat"><small>Produk aktif</small><strong><?= $counts['products'] ?></strong></article>
            <article class="stat"><small>Semua pesanan</small><strong><?= $counts['orders'] ?></strong></article>
            <article class="stat"><small>Menunggu diproses</small><strong><?= $counts['pending'] ?></strong></article>
        </section>
        <section class="card">
            <div class="card-head">
                <h2>Pesanan terbaru</h2><a class="button secondary" href="orders.php">Lihat semua</a>
            </div>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Nomor pesanan</th>
                            <th>Produk</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Dibuat</th>
                        </tr>
                    </thead>
                    <tbody><?php if (!$orders): ?>
                            <tr>
                                <td colspan="5" class="muted">Belum ada pesanan.</td>
                            </tr><?php endif;
                    foreach ($orders as $order): ?>
                            <tr>
                                <td><b><?= e($order['order_number']) ?></b></td>
                                <td><?= e($order['product_name']) ?></td>
                                <td class="amount">Rp<?= number_format($order['total'], 0, ',', '.') ?></td>
                                <td><span class="badge <?= e($order['status']) ?>"><?= e($order['status']) ?></span></td>
                                <td class="muted"><?= e($order['created_at']) ?></td>
                            </tr><?php endforeach ?>
                    </tbody>
                </table>
            </div>
        </section>
    </main>
</body>

</html>