exports.getAll = async (req, res) => {
  try {
    const [rows] = await req.db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products" });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, price, stock, category_id } = req.body;

    await req.db.query(
      "INSERT INTO products (name, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, stock, category_id]
    );

    res.json({ message: "Product created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating product" });
  }
};
