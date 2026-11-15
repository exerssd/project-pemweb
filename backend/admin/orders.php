<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
require_admin_page();
$pdo = db();
$valid = ['pending', 'processed', 'completed', 'cancelled'];
if ($_SERVER['REQUEST_METHOD'] === 'POST' && in_array($_POST['status'] ?? '', $valid, true)) {
    $pdo->prepare('UPDATE orders SET status=? WHERE id=?')->execute([$_POST['status'], (int) $_POST['id']]);
    header('Location: orders.php');
    exit;
}
$orders = $pdo->query('SELECT o.*,u.name customer_name,u.email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.id DESC')->fetchAll();
?>
<!doctype html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pesanan - VioletStore</title>
    <link rel="stylesheet" href="admin.css">
</head>

<body>
    <header class="topbar">
        <div class="shell"><a class="brand" href="index.php">VIOLET<span>STORE</span></a>
            <nav class="nav"><a href="index.php">Dashboard</a><a href="products.php">Produk</a><a class="active"
                    href="orders.php">Pesanan</a><a class="logout" href="logout.php">Keluar</a></nav>
        </div>
    </header>
    <main class="shell page">
        <div class="page-head">
            <div>
                <p class="eyebrow">Transaksi</p>
                <h1>Pesanan pelanggan</h1>
                <p class="subtitle">Perbarui status setelah pesanan diproses.</p>
            </div><span class="muted"><?= count($orders) ?> pesanan</span>
        </div>
        <section class="card">
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Pesanan</th>
                            <th>Pelanggan</th>
                            <th>Produk</th>
                            <th>Pembayaran</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody><?php if (!$orders): ?>
                            <tr>
                                <td colspan="6" class="muted">Belum ada pesanan.</td>
                            </tr><?php endif;
                    foreach ($orders as $o): ?>
                            <tr>
                                <td><b><?= e($o['order_number']) ?></b>
                                    <div class="muted"><?= e($o['created_at']) ?></div>
                                </td>
                                <td><?= e($o['customer_name']) ?>
                                    <div class="muted"><?= e($o['email']) ?></div>
                                </td>
                                <td><?= e($o['product_name']) ?> x <?= e($o['quantity']) ?>
                                    <div class="muted">Username: <?= e($o['game_username']) ?></div>
                                </td>
                                <td><?= e($o['payment_method']) ?></td>
                                <td class="amount">Rp<?= number_format($o['total'], 0, ',', '.') ?></td>
                                <td>
                                    <form method="post" class="actions"><input type="hidden" name="id"
                                            value="<?= $o['id'] ?>"><select name="status"><?php foreach ($valid as $status): ?>
                                                <option value="<?= $status ?>" <?= $o['status'] === $status ? 'selected' : '' ?>>
                                                    <?= ucfirst($status) ?></option><?php endforeach ?>
                                        </select><button class="button">Simpan</button></form>
                                </td>
                            </tr><?php endforeach ?>
                    </tbody>
                </table>
            </div>
        </section>
    </main>
</body>

</html>