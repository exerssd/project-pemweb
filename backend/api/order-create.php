<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';
$user = require_login('customer');
$data = request_data();
$productId = (int) ($data['product_id'] ?? 0);
$quantity = max(1, min(99, (int) ($data['quantity'] ?? 1)));
$username = clean_string($data['game_username'] ?? '', 100);
$payment = clean_string($data['payment_method'] ?? '', 50);
if (!$productId || mb_strlen($username) < 3 || $payment === '')
  json_response(['message' => 'Produk, username game, dan metode pembayaran wajib diisi.'], 422);
$pdo = db();
$pdo->beginTransaction();
try {
  $query = $pdo->prepare('SELECT * FROM products WHERE id = ? AND is_active = 1 FOR UPDATE');
  $query->execute([$productId]);
  $product = $query->fetch();
  if (!$product || ($product['stock'] !== null && $product['stock'] < $quantity)) {
    $pdo->rollBack();
    json_response(['message' => 'Produk tidak tersedia atau stok tidak cukup.'], 422);
  }
  $total = $product['price'] * $quantity;
  $number = order_number();
  $insert = $pdo->prepare('INSERT INTO orders (order_number,user_id,product_id,product_name,price,quantity,total,game_username,payment_method) VALUES (?,?,?,?,?,?,?,?,?)');
  $insert->execute([$number, $user['id'], $product['id'], $product['name'], $product['price'], $quantity, $total, $username, $payment]);
  if ($product['stock'] !== null)
    $pdo->prepare('UPDATE products SET stock = stock - ? WHERE id = ?')->execute([$quantity, $product['id']]);
  $pdo->commit();
  json_response(['message' => 'Pesanan berhasil dibuat.', 'order_number' => $number, 'total' => $total], 201);
} catch (Throwable $exception) {
  if ($pdo->inTransaction())
    $pdo->rollBack();
  json_response(['message' => 'Pesanan gagal dibuat.'], 500);
}
