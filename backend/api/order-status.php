<?php
require_once __DIR__ . '/../includes/auth.php';
$user = require_login('customer');
$query = db()->prepare('SELECT order_number, product_name, price, quantity, total, game_username, payment_method, status, created_at FROM orders WHERE user_id = ? ORDER BY id DESC');
$query->execute([$user['id']]);
json_response(['orders' => $query->fetchAll()]);
