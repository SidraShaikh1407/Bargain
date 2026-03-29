import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "bargain-secret-key";
const PORT = 3000;

// Initialize Database
const db = new Database("bargain_v2.db");

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_seller INTEGER DEFAULT 0,
    seller_rating REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    base_price REAL NOT NULL,
    min_price REAL NOT NULL,
    image_url TEXT,
    seller_id INTEGER NOT NULL,
    stock_count INTEGER DEFAULT 10,
    FOREIGN KEY (seller_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS negotiations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    offer_price REAL NOT NULL,
    status TEXT NOT NULL,
    suggested_price REAL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    negotiated_price REAL NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// Migration: Add columns if they don't exist
const usersTableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
if (!usersTableInfo.some(c => c.name === 'seller_rating')) {
  db.prepare("ALTER TABLE users ADD COLUMN seller_rating REAL DEFAULT 0").run();
}

const productsTableInfo = db.prepare("PRAGMA table_info(products)").all() as any[];
if (!productsTableInfo.some(c => c.name === 'stock_count')) {
  db.prepare("ALTER TABLE products ADD COLUMN stock_count INTEGER DEFAULT 10").run();
}
if (!productsTableInfo.some(c => c.name === 'image_url')) {
  db.prepare("ALTER TABLE products ADD COLUMN image_url TEXT").run();
}

// Seed Data
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync("password123", 10);
  db.prepare("INSERT INTO users (name, email, password, is_seller, seller_rating) VALUES (?, ?, ?, ?, ?)").run(
    "Tech Seller", "seller@example.com", hashedPassword, 1, 4.8
  );
  db.prepare("INSERT INTO users (name, email, password, is_seller, seller_rating) VALUES (?, ?, ?, ?, ?)").run(
    "Fashion Hub", "fashion@example.com", hashedPassword, 1, 4.2
  );
}

const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const sellers = db.prepare("SELECT id FROM users WHERE is_seller = 1").all() as { id: number }[];

  const products = [
    // Electronics & Gadgets
    ["iPhone 15 Pro", "Electronics & Gadgets", 65000, 62000, "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800", 15],
    ["MacBook Air M2", "Electronics & Gadgets", 85000, 82450, "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQE96SCvVi7vKCBXBQdwqL8CLo2DNopt1tArVTroLXMKeackQoXdBkHzVgCbH0FxD-jUESo4nmsphDsP5OZqXndn1eYbVoEksTJgngBazxC5KCEb6LpQD4IwQ", 8],
    ["Sony WH-1000XM5", "Electronics & Gadgets", 27490, 25500, "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800", 25],
    ["Samsung Galaxy S24 Ultra", "Electronics & Gadgets", 119999, 115000, "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800", 12],
    ["iPad Pro M4", "Electronics & Gadgets", 88900, 85500, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", 5],

    // Fashion & Apparel
    ["Cotton Slim Fit Shirt", "Fashion & Apparel", 2499, 1799, "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80", 50],
    ["Leather Boots", "Fashion & Apparel", 5999, 4599, "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80", 20],
    ["Silk Saree", "Fashion & Apparel", 12500, 9200, "https://images.unsplash.com/photo-1610030469668-8f9c7cba0f2c?w=800&q=80", 10],
    ["Denim Jacket", "Fashion & Apparel", 3499, 2699, "https://images.unsplash.com/photo-1520975922284-9c4f9d2b8f36?w=800&q=80", 30],
    ["Running Shoes", "Fashion & Apparel", 4999, 3799, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", 40],

    // Home & Furniture
    ["Ergonomic Office Chair", "Home & Furniture", 18500, 15000, "https://images-eu.ssl-images-amazon.com/images/I/71hv7GczmZL._AC_SL1500_.jpg", 15],
    ["Modern Coffee Table", "Home & Furniture", 9999, 7500, "https://images-eu.ssl-images-amazon.com/images/I/71kEBCjRRrL._SL1500_.jpg", 10],
    ["King Size Bed", "Home & Furniture", 48000, 42000, "https://images-eu.ssl-images-amazon.com/images/I/71nCMBJOxNL._SL1500_.jpg", 5],
    ["3-Seater Sofa", "Home & Furniture", 25000, 21000, "https://images-eu.ssl-images-amazon.com/images/I/81Rg-wCFHJL._SL1500_.jpg", 7],
    ["Dining Table Set", "Home & Furniture", 35000, 30000, "https://images-eu.ssl-images-amazon.com/images/I/71iyJ0JRSSL._SL1500_.jpg", 4],

    // Beauty & Personal Care
    ["Face Serum (Vitamin C)", "Beauty & Personal Care", 899, 650, "https://images-eu.ssl-images-amazon.com/images/I/61OpvPRMR5L._SL1500_.jpg", 100],
    ["Electric Toothbrush", "Beauty & Personal Care", 3499, 2800, "https://images-eu.ssl-images-amazon.com/images/I/61FJbRMqpkL._SL1500_.jpg", 45],
    ["Hair Dryer", "Beauty & Personal Care", 2999, 2200, "https://images-eu.ssl-images-amazon.com/images/I/41CfkCDC56L._SL1500_.jpg", 35],
    ["Beard Trimmer", "Beauty & Personal Care", 1899, 1400, "https://images-eu.ssl-images-amazon.com/images/I/61xTXEq4OcL._SL1500_.jpg", 60],
    ["Luxury Perfume", "Beauty & Personal Care", 4500, 3800, "https://images-eu.ssl-images-amazon.com/images/I/51jfqOKEFHL._SL1500_.jpg", 25],

    // Grocery & Food
    ["Organic Basmati Rice 5kg", "Grocery & Food", 950, 850, "https://images-eu.ssl-images-amazon.com/images/I/81KZfzjKcEL._SL1500_.jpg", 200],
    ["Dark Chocolate Gift Box", "Grocery & Food", 1499, 1200, "https://images-eu.ssl-images-amazon.com/images/I/81BF-4ORDAL._SL1500_.jpg", 80],
    ["Cold Pressed Olive Oil 1L", "Grocery & Food", 1200, 1000, "https://images-eu.ssl-images-amazon.com/images/I/71XynHPGJQL._SL1500_.jpg", 50],
    ["Premium Tea Leaves 500g", "Grocery & Food", 450, 380, "https://images-eu.ssl-images-amazon.com/images/I/81BFIBPkCWL._SL1500_.jpg", 150],
    ["Instant Coffee Jar 200g", "Grocery & Food", 650, 550, "https://images-eu.ssl-images-amazon.com/images/I/81EGBtHMIeL._SL1500_.jpg", 120],

    // Sports & Outdoors
    ["Yoga Mat (Extra Thick)", "Sports & Outdoors", 1999, 1400, "https://images-eu.ssl-images-amazon.com/images/I/71CkLLSrFQL._SL1500_.jpg", 40],
    ["Badminton Racket Set", "Sports & Outdoors", 4500, 3500, "https://images-eu.ssl-images-amazon.com/images/I/71BHFWpn9QL._SL1500_.jpg", 25],
    ["Adjustable Dumbbells 20kg", "Sports & Outdoors", 8500, 7200, "https://images-eu.ssl-images-amazon.com/images/I/71GRNjMq4jL._SL1500_.jpg", 15],
    ["Camping Tent (4-Person)", "Sports & Outdoors", 5500, 4500, "https://images-eu.ssl-images-amazon.com/images/I/81TAvIOVmgL._SL1500_.jpg", 10],
    ["Cricket Bat (English Willow)", "Sports & Outdoors", 12000, 10000, "https://images-eu.ssl-images-amazon.com/images/I/51Lqz5yEiAL._SL1500_.jpg", 8],

    // Toys & Baby Products
    ["LEGO Star Wars Set", "Toys & Baby Products", 7999, 6500, "https://www.lego.com/cdn/cs/set/assets/blt0567f28c0a736dae/75375.jpg?fit=bounds&format=webply&quality=80&width=800&height=600&dpr=1", 12],
    ["Baby Stroller", "Toys & Baby Products", 14500, 12000, "https://images-eu.ssl-images-amazon.com/images/I/61dfUqJnkGL._SL1500_.jpg", 6],
    ["Remote Control Car", "Toys & Baby Products", 2499, 1800, "https://images-eu.ssl-images-amazon.com/images/I/71Swqqe7XAL._SL1500_.jpg", 25],
    ["Educational Tablet for Kids", "Toys & Baby Products", 4500, 3800, "https://images-eu.ssl-images-amazon.com/images/I/71DP-HBCL0L._SL1500_.jpg", 15],
    ["Soft Plush Bear (Large)", "Toys & Baby Products", 1200, 900, "https://images-eu.ssl-images-amazon.com/images/I/71YKCb21YKL._SL1500_.jpg", 50],

    // Books, Music & Movies
    ["The Alchemist (Hardcover)", "Books, Music & Movies", 599, 450, "https://images-eu.ssl-images-amazon.com/images/I/71aFt4+OTOL._SL1500_.jpg", 100],
    ["Vinyl Record Player", "Books, Music & Movies", 18500, 15000, "https://images-eu.ssl-images-amazon.com/images/I/71TXb+PZNZL._SL1500_.jpg", 10],
    ["Acoustic Guitar", "Books, Music & Movies", 8500, 7000, "https://images-eu.ssl-images-amazon.com/images/I/81FQxEG+5sL._SL1500_.jpg", 15],
    ["Harry Potter Box Set", "Books, Music & Movies", 3500, 2800, "https://images-eu.ssl-images-amazon.com/images/I/71IQ9HjIiGL._SL1500_.jpg", 20],
    ["Wireless Bluetooth Speaker", "Books, Music & Movies", 5999, 4800, "https://images-eu.ssl-images-amazon.com/images/I/71JB6hM6Z6L._SL1500_.jpg", 40],

    // Automotive & Tools
    ["Car Vacuum Cleaner", "Automotive & Tools", 2999, 2200, "https://images-eu.ssl-images-amazon.com/images/I/71vB8TF9CLL._SL1500_.jpg", 30],
    ["Socket Wrench Set", "Automotive & Tools", 4500, 3800, "https://images-eu.ssl-images-amazon.com/images/I/81f5j8eTKcL._SL1500_.jpg", 20],
    ["Portable Tire Inflator", "Automotive & Tools", 3200, 2600, "https://images-eu.ssl-images-amazon.com/images/I/71JWnA7BPJL._SL1500_.jpg", 25],
    ["Car Dash Cam (4K)", "Automotive & Tools", 7500, 6200, "https://images-eu.ssl-images-amazon.com/images/I/71A4QJbwPeL._SL1500_.jpg", 15],
    ["Pressure Washer", "Automotive & Tools", 9500, 8000, "https://images-eu.ssl-images-amazon.com/images/I/71xo0sJSuML._SL1500_.jpg", 10],

    // Health & Wellness
    ["Multivitamin Tablets", "Health & Wellness", 1299, 950, "https://images-eu.ssl-images-amazon.com/images/I/71arPMQMsFL._SL1500_.jpg", 150],
    ["Digital Blood Pressure Monitor", "Health & Wellness", 3499, 2900, "https://images-eu.ssl-images-amazon.com/images/I/61rKBwLDmCL._SL1500_.jpg", 40],
    ["Smart Fitness Band", "Health & Wellness", 2499, 1900, "https://images-eu.ssl-images-amazon.com/images/I/61IwlnEdhuL._SL1500_.jpg", 60],
    ["Electric Massager Gun", "Health & Wellness", 4500, 3800, "https://images-eu.ssl-images-amazon.com/images/I/61YiS3LKHGL._SL1500_.jpg", 25],
    ["Air Purifier (HEPA Filter)", "Health & Wellness", 12500, 10500, "https://images-eu.ssl-images-amazon.com/images/I/61tDS1LqpPL._SL1500_.jpg", 12],
  ];
  const stmt = db.prepare("INSERT INTO products (name, category, base_price, min_price, image_url, stock_count, seller_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
  products.forEach((p, index) => {
    const sellerId = sellers[index % sellers.length].id;
    stmt.run(p[0], p[1], p[2], p[3], p[4], p[5], sellerId);
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // --- Auth Routes ---
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, is_seller } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const stmt = db.prepare("INSERT INTO users (name, email, password, is_seller) VALUES (?, ?, ?, ?)");
      const result = stmt.run(name, email, hashedPassword, is_seller ? 1 : 0);
      res.json({ id: result.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, is_seller: user.is_seller }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_seller: user.is_seller,
        seller_rating: user.seller_rating
      }
    });
  });

  // --- Product Routes ---
  app.get("/api/products", (req, res) => {
    const { minPrice, maxPrice, minRating, availableOnly, category, search } = req.query;

    let query = "SELECT p.*, u.name as seller_name, u.seller_rating FROM products p JOIN users u ON p.seller_id = u.id WHERE 1=1";
    const params: any[] = [];

    if (category) {
      query += " AND p.category = ?";
      params.push(category);
    }

    if (search) {
      query += " AND p.name LIKE ?";
      params.push(`%${search}%`);
    }

    if (minPrice) {
      query += " AND p.base_price >= ?";
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += " AND p.base_price <= ?";
      params.push(Number(maxPrice));
    }

    if (minRating) {
      query += " AND u.seller_rating >= ?";
      params.push(Number(minRating));
    }

    if (availableOnly === 'true') {
      query += " AND p.stock_count > 0";
    }

    const products = db.prepare(query).all(...params);
    res.json(products);
  });

  app.get("/api/products/:id", (req, res) => {
    const product = db.prepare("SELECT p.*, u.name as seller_name, u.seller_rating FROM products p JOIN users u ON p.seller_id = u.id WHERE p.id = ?").get(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  });

  app.post("/api/products", authenticateToken, (req: any, res) => {
    if (!req.user.is_seller) return res.status(403).json({ error: "Only sellers can add products" });
    const { name, category, base_price, min_price, image_url } = req.body;
    const stmt = db.prepare("INSERT INTO products (name, category, base_price, min_price, image_url, seller_id) VALUES (?, ?, ?, ?, ?, ?)");
    const result = stmt.run(name, category, base_price, min_price, image_url, req.user.id);
    res.json({ id: result.lastInsertRowid });
  });

  // --- Negotiation Engine ---
  app.post("/api/negotiate", authenticateToken, (req: any, res) => {
    const { product_id, user_offer } = req.body;
    const product: any = db.prepare("SELECT * FROM products WHERE id = ?").get(product_id);

    if (!product) return res.status(404).json({ error: "Product not found" });

    let status = "rejected";
    let suggested_price = null;

    // Realistic threshold for Rupees: 5% of base price or 500, whichever is higher
    const threshold = Math.max(500, product.base_price * 0.05);

    if (user_offer >= product.min_price) {
      status = "accepted";
    } else if (product.min_price - user_offer <= threshold) {
      status = "counter_offer";
      suggested_price = product.min_price;
    }

    const stmt = db.prepare("INSERT INTO negotiations (user_id, product_id, offer_price, status, suggested_price) VALUES (?, ?, ?, ?, ?)");
    stmt.run(req.user.id, product_id, user_offer, status, suggested_price);

    res.json({ status, suggested_price });
  });

  // --- Cart System ---
  app.get("/api/cart", authenticateToken, (req: any, res) => {
    const items: any[] = db.prepare(`
      SELECT c.*, p.name, p.category, p.image_url, p.seller_id, u.name as seller_name 
      FROM cart_items c 
      JOIN products p ON c.product_id = p.id 
      JOIN users u ON p.seller_id = u.id
      WHERE c.user_id = ?
    `).all(req.user.id);

    // Bulk Discount Logic
    // Group by seller
    const sellerGroups: { [key: number]: any[] } = {};
    items.forEach(item => {
      if (!sellerGroups[item.seller_id]) sellerGroups[item.seller_id] = [];
      sellerGroups[item.seller_id].push(item);
    });

    let subtotal = 0;
    let discount = 0;

    Object.values(sellerGroups).forEach(group => {
      const groupTotal = group.reduce((sum, item) => sum + item.negotiated_price, 0);
      subtotal += groupTotal;
      if (group.length >= 3) {
        discount += groupTotal * 0.1;
      }
    });

    res.json({ items, subtotal, discount, total: subtotal - discount });
  });

  app.post("/api/cart", authenticateToken, (req: any, res) => {
    const { product_id, negotiated_price } = req.body;
    const stmt = db.prepare("INSERT INTO cart_items (user_id, product_id, negotiated_price) VALUES (?, ?, ?)");
    stmt.run(req.user.id, product_id, negotiated_price);
    res.json({ success: true });
  });

  app.delete("/api/cart/:id", authenticateToken, (req: any, res) => {
    db.prepare("DELETE FROM cart_items WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // --- Order System ---
  app.post("/api/orders/checkout", authenticateToken, (req: any, res) => {
    const user_id = req.user.id;
    const cart: any = app.get("cart_logic")(user_id); // Helper to get cart stats

    if (cart.items.length === 0) return res.status(400).json({ error: "Cart is empty" });

    const orderStmt = db.prepare("INSERT INTO orders (user_id, total_price) VALUES (?, ?)");
    const orderResult = orderStmt.run(user_id, cart.total);
    const orderId = orderResult.lastInsertRowid;

    const itemStmt = db.prepare("INSERT INTO order_items (order_id, product_id, price) VALUES (?, ?, ?)");
    cart.items.forEach((item: any) => {
      // Apply individual item discount if applicable
      const sellerItemCount = cart.items.filter((i: any) => i.seller_id === item.seller_id).length;
      const finalPrice = sellerItemCount >= 3 ? item.negotiated_price * 0.9 : item.negotiated_price;
      itemStmt.run(orderId, item.product_id, finalPrice);
    });

    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(user_id);
    res.json({ orderId });
  });

  // Helper for checkout logic
  app.set("cart_logic", (user_id: number) => {
    const items: any[] = db.prepare(`
      SELECT c.*, p.seller_id 
      FROM cart_items c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ?
    `).all(user_id);

    const sellerGroups: { [key: number]: any[] } = {};
    items.forEach(item => {
      if (!sellerGroups[item.seller_id]) sellerGroups[item.seller_id] = [];
      sellerGroups[item.seller_id].push(item);
    });

    let subtotal = 0;
    let discount = 0;
    Object.values(sellerGroups).forEach(group => {
      const groupTotal = group.reduce((sum, item) => sum + item.negotiated_price, 0);
      subtotal += groupTotal;
      if (group.length >= 3) discount += groupTotal * 0.1;
    });

    return { items, total: subtotal - discount };
  });

  app.get("/api/orders", authenticateToken, (req: any, res) => {
    const orders: any[] = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT oi.*, p.name 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `).all(order.id);
      return { ...order, items };
    });
    res.json(ordersWithItems);
  });

  // --- Vite / Static Files ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
