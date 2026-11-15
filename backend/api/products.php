<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/response.php';
$rows = db()->query('SELECT id, name, description, price, stock, image_url FROM products WHERE is_active = 1 ORDER BY price ASC')->fetchAll();
json_response(['products' => $rows]);
