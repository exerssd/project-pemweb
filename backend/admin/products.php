<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
require_admin_page();
$pdo = db();
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $id = (int) ($_POST['id'] ?? 0);
    if ($action === 'delete' && $id)
        $pdo->prepare('UPDATE products SET is_active=0 WHERE id=?')->execute([$id]);
    if ($action === 'save') {
        $name = clean_string($_POST['name'] ?? '', 150);
        $price = (int) ($_POST['price'] ?? 0);
        $description = clean_string($_POST['description'] ?? '', 2000);
        $image = clean_string($_POST['image_url'] ?? '', 500);
        $stock = $_POST['stock'] === '' ? null : (int) $_POST['stock'];
        if ($name === '' || $price < 0 || ($stock !== null && $stock < 0))
            $error = 'Nama, harga, dan stok tidak valid.';
        elseif ($id)
            $pdo->prepare('UPDATE products SET name=?,description=?,price=?,stock=?,image_url=? WHERE id=?')->execute([$name, $description ?: null, $price, $stock, $image ?: null, $id]);
        else
            $pdo->prepare('INSERT INTO products (name,description,price,stock,image_url) VALUES (?,?,?,?,?)')->execute([$name, $description ?: null, $price, $stock, $image ?: null]);
    }
    if (!$error) {
        header('Location: products.php');
        exit;
    }
}
$edit = isset($_GET['edit']) ? $pdo->prepare('SELECT * FROM products WHERE id=?') : null;
if ($edit) {
    $edit->execute([(int) $_GET['edit']]);
    $edit = $edit->fetch() ?: [];
} else
    $edit = [];
$rows = $pdo->query('SELECT * FROM products ORDER BY is_active DESC,id DESC')->fetchAll();
?>
<!doctype html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Produk - VioletStore</title>
    <link rel="stylesheet" href="admin.css">
</head>

<body>
    <header class="topbar">
        <div class="shell"><a class="brand" href="index.php">VIOLET<span>STORE</span></a>
            <nav class="nav"><a href="index.php">Dashboard</a><a class="active" href="products.php">Produk</a><a
                    href="orders.php">Pesanan</a><a class="logout" href="logout.php">Keluar</a></nav>
        </div>
    </header>
    <main class="shell page">
        <div class="page-head">
            <div>
                <p class="eyebrow">Katalog</p>
                <h1>Kelola produk</h1>
                <p class="subtitle">Tambah, ubah, atau nonaktifkan produk toko.</p>
            </div>
        </div>
        <div class="split">
            <section class="card form-card">
                <div class="card-head">
                    <h2><?= $edit ? 'Ubah produk' : 'Tambah produk' ?></h2><?php if ($edit): ?><a class="button secondary"
                            href="products.php">Batal</a><?php endif ?>
                </div><?php if ($error): ?>
                    <p class="alert"><?= e($error) ?></p><?php endif ?>
                <form method="post"><input type="hidden" name="action" value="save"><input type="hidden" name="id"
                        value="<?= e($edit['id'] ?? '') ?>">
                    <div class="field"><label>Nama produk</label><input name="name" value="<?= e($edit['name'] ?? '') ?>"
                            required></div>
                    <div class="field"><label>Deskripsi</label><textarea
                            name="description"><?= e($edit['description'] ?? '') ?></textarea></div>
                    <div class="field"><label>Harga (Rp)</label><input name="price" type="number" min="0"
                            value="<?= e($edit['price'] ?? '') ?>" required></div>
                    <div class="field"><label>Stok</label><input name="stock" type="number" min="0"
                            value="<?= e($edit['stock'] ?? '') ?>"><small>Kosongkan jika stok tidak terbatas.</small></div>
                    <div class="field"><label>URL gambar</label><input name="image_url"
                            value="<?= e($edit['image_url'] ?? '') ?>"></div><button class="button">Simpan produk</button>
                </form>
            </section>
            <section class="card">
                <div class="card-head">
                    <h2>Daftar produk</h2><span class="muted"><?= count($rows) ?> produk</span>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Produk</th>
                                <th>Harga</th>
                                <th>Stok</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody><?php if (!$rows): ?>
                                <tr>
                                    <td colspan="5" class="muted">Belum ada produk.</td>
                                </tr><?php endif;
                        foreach ($rows as $p): ?>
                                <tr>
                                    <td><b><?= e($p['name']) ?></b><?php if ($p['description']): ?>
                                            <div class="muted"><?= e($p['description']) ?></div><?php endif ?>
                                    </td>
                                    <td class="amount">Rp<?= number_format($p['price'], 0, ',', '.') ?></td>
                                    <td><?= $p['stock'] === null ? 'Tidak terbatas' : e($p['stock']) ?></td>
                                    <td><span
                                            class="badge <?= $p['is_active'] ? 'active-status' : 'inactive' ?>"><?= $p['is_active'] ? 'Aktif' : 'Dihapus' ?></span>
                                    </td>
                                    <td><?php if ($p['is_active']): ?>
                                            <div class="actions"><a class="button secondary" href="?edit=<?= $p['id'] ?>">Ubah</a>
                                                <form class="inline-form" method="post"
                                                    onsubmit="return confirm('Hapus produk ini?')"><input type="hidden"
                                                        name="action" value="delete"><input type="hidden" name="id"
                                                        value="<?= $p['id'] ?>"><button class="button danger">Hapus</button>
                                                </form>
                                            </div><?php endif ?>
                                    </td>
                                </tr><?php endforeach ?>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </main>
</body>

</html>