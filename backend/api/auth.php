<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
$data = request_data();
$action = $data['action'] ?? $_GET['action'] ?? 'profile';
if ($action === 'register') {
  $name = clean_string($data['name'] ?? '', 100);
  $email = strtolower(clean_string($data['email'] ?? '', 150));
  $password = (string) ($data['password'] ?? '');
  if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8)
    json_response(['message' => 'Nama, email valid, dan password minimal 8 karakter diperlukan.'], 422);
  try {
    $stmt = db()->prepare('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)');
    $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
    $_SESSION['user'] = ['id' => (int) db()->lastInsertId(), 'name' => $name, 'email' => $email, 'role' => 'customer'];
    json_response(['message' => 'Akun berhasil dibuat.', 'user' => $_SESSION['user']], 201);
  } catch (PDOException $e) {
    json_response(['message' => 'Email sudah terdaftar.'], 422);
  }
}
if ($action === 'login') {
  $email = strtolower(clean_string($data['email'] ?? '', 150));
  $password = (string) ($data['password'] ?? '');
  $stmt = db()->prepare('SELECT id,name,email,password_hash,role FROM users WHERE email = ? LIMIT 1');
  $stmt->execute([$email]);
  $found = $stmt->fetch();
  if (!$found || !password_verify($password, $found['password_hash']))
    json_response(['message' => 'Email atau password salah.'], 422);
  if ($found['role'] !== 'customer')
    json_response(['message' => 'Gunakan akun pelanggan untuk membuat pesanan.'], 403);
  $_SESSION['user'] = ['id' => (int) $found['id'], 'name' => $found['name'], 'email' => $found['email'], 'role' => $found['role']];
  json_response(['message' => 'Login berhasil.', 'user' => $_SESSION['user']]);
}
if ($action === 'logout') {
  $_SESSION = [];
  session_destroy();
  json_response(['message' => 'Logout berhasil.']);
}
json_response(['user' => signed_in_user()]);
