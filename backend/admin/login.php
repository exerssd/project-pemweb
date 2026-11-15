<?php
require_once __DIR__ . '/../includes/auth.php';
if (signed_in_user() && signed_in_user()['role'] === 'admin') {
  header('Location: index.php');
  exit;
}
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $stmt = db()->prepare("SELECT id,name,email,password_hash,role FROM users WHERE email = ? AND role = 'admin' LIMIT 1");
  $stmt->execute([strtolower(trim($_POST['email'] ?? ''))]);
  $user = $stmt->fetch();
  if ($user && password_verify($_POST['password'] ?? '', $user['password_hash'])) {
    $_SESSION['user'] = ['id' => (int) $user['id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => 'admin'];
    header('Location: index.php');
    exit;
  }
  $error = 'Email atau password admin salah.';
}
?>
<!doctype html>
<html lang="id">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login Admin - VioletStore</title>
  <link rel="stylesheet" href="admin.css">
</head>

<body class="login-page">
  <main class="login-card">
    <div class="login-brand">VIOLET<span>STORE</span></div>
    <h1>Masuk ke dashboard</h1>
    <p class="subtitle">Gunakan akun administrator untuk mengelola produk dan pesanan.</p><?php if ($error): ?>
      <p class="alert"><?= htmlspecialchars($error) ?></p><?php endif ?>
    <form method="post">
      <div class="field"><label for="email">Email admin</label><input id="email" name="email" type="email"
          autocomplete="email" required autofocus></div>
      <div class="field"><label for="password">Password</label><input id="password" name="password" type="password"
          autocomplete="current-password" required></div><button class="button" type="submit">Masuk ke
        dashboard</button>
    </form>
    <p class="login-note">Halaman ini khusus untuk administrator VioletStore.</p>
  </main>
</body>

</html>