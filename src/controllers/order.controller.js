exports.createOrder = async (req, res) => {
  const connection = await req.db.getConnection();

  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    await connection.beginTransaction();

    let totalAmount = 0;

    for (const item of items) {
      const [product] = await connection.query(
        "SELECT id, price, stock FROM products WHERE id = ?",
        [item.product_id]
      );

      if (product.length === 0)
        throw new Error("Product not found");

      if (product[0].stock < item.quantity)
        throw new Error("Insufficient stock");

      totalAmount += product[0].price * item.quantity;
    }

    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, total_amount) VALUES (?, ?)",
      [userId, totalAmount]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      const [product] = await connection.query(
        "SELECT price, stock FROM products WHERE id = ?",
        [item.product_id]
      );

      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, product[0].price]
      );

      await connection.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    await connection.commit();

    res.json({ message: "Order placed successfully", orderId });

  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};

exports.getMyOrders = async (req, res) => {
  const [orders] = await req.db.query(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC",
    [req.user.id]
  );

  res.json(orders);
};

exports.getOrderById = async (req, res) => {
  const orderId = req.params.id;

  const [order] = await req.db.query(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?",
    [orderId, req.user.id]
  );

  if (order.length === 0)
    return res.status(404).json({ message: "Order not found" });

  const [items] = await req.db.query(
    "SELECT * FROM order_items WHERE order_id = ?",
    [orderId]
  );

  res.json({
    order: order[0],
    items
  });
};
