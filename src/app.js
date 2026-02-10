const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(express.json());

const masterPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_ROOT_USER,
  password: process.env.DB_ROOT_PASS,
  database: "tenants_master",
  waitForConnections: true,
  connectionLimit: 10
});

const tenantPools = {};

async function getTenantPool(subdomain) {
  if (tenantPools[subdomain]) return tenantPools[subdomain];

  const [rows] = await masterPool.query(
    "SELECT db_name FROM tenants WHERE subdomain = ?",
    [subdomain]
  );

  if (rows.length === 0) return null;

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_ROOT_USER,
    password: process.env.DB_ROOT_PASS,
    database: rows[0].db_name,
    waitForConnections: true,
    connectionLimit: 10
  });

  tenantPools[subdomain] = pool;
  return pool;
}

app.use(async (req, res, next) => {
  const host = req.headers.host;
  const subdomain = host.split('.')[0];

  const tenantDB = await getTenantPool(subdomain);
  if (!tenantDB) {
    return res.status(404).json({ message: "Tenant not found" });
  }

  req.db = tenantDB;
  req.tenant = subdomain;
  next();
});

app.get('/api', async (req, res) => {
  const [rows] = await req.db.query("SELECT DATABASE() as db");
  res.json({
    tenant: req.tenant,
    database: rows[0].db
  });
});

app.listen(process.env.PORT, () => {
  console.log("SaaS running on port " + process.env.PORT);
});
