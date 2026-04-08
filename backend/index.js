require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcrypt");
const https = require("https");

const app = express();
app.use(cors());
app.use(express.json());

// ==================== Database Connection ====================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==================== AWS IoT Connection (cert-based HTTPS) ====================
const iotAgent = new https.Agent({
  cert: process.env.AWS_IOT_CERT,
  key: process.env.AWS_IOT_PRIVATE_KEY,
  ca: process.env.AWS_IOT_ROOT_CA,
});

async function publishToIoT(topic, payload) {
  const body = JSON.stringify(payload);
  const endpoint = process.env.AWS_IOT_DATA_ENDPOINT;
  const path = `/topics/${encodeURIComponent(topic)}?qos=0`;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: endpoint,
        port: 8443,
        path,
        method: "POST",
        agent: iotAgent,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`IoT publish failed: ${res.statusCode} ${data}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ==================== Helpers ====================
function formatDate(val) {
  if (!val) return null;
  const d = new Date(val);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function toModeArray(val) {
  if (!val) return null;
  return Array.isArray(val) ? val : [val];
}
function fromModeArray(val) {
  if (!val) return null;
  return Array.isArray(val) ? (val[0] || null) : val;
}

// ==================== DB Init ====================
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id           SERIAL PRIMARY KEY,
      user_id      UUID REFERENCES users(id),
      pod_id       TEXT,
      pod_name     TEXT,
      location     TEXT,
      booking_date DATE    DEFAULT CURRENT_DATE,
      time_label   TEXT,
      people_count INTEGER DEFAULT 1,
      status       TEXT    DEFAULT 'active',
      created_at   TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS birthday_cards (
      id          SERIAL PRIMARY KEY,
      from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      to_user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
      card_design  TEXT DEFAULT '1',
      message      TEXT,
      created_at   TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS knocks (
      id           SERIAL PRIMARY KEY,
      from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      to_user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
      dismissed    BOOLEAN DEFAULT FALSE,
      created_at   TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS events (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      date_label  TEXT,
      icon        TEXT DEFAULT '📅',
      created_by  UUID REFERENCES users(id),
      created_at  TIMESTAMP DEFAULT NOW()
    );
  `);
  // Step 1 — add new columns if missing
  const addCols = [
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pod_id       TEXT`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pod_name     TEXT`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location     TEXT`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date DATE DEFAULT CURRENT_DATE`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS time_label   TEXT`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS people_count INTEGER DEFAULT 1`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status       TEXT DEFAULT 'active'`,
  ];
  for (const sql of addCols) {
    await pool.query(sql).catch((err) => console.warn("Migration warn:", err.message));
  }

  // Step 2 — dynamically drop NOT NULL from ALL non-PK columns
  // Handles any legacy schema (start_time, end_time, pin_code, etc.) without needing to know names
  const legacyCols = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'bookings'
      AND is_nullable  = 'NO'
      AND column_name  != 'id'
  `);
  for (const { column_name } of legacyCols.rows) {
    await pool.query(`ALTER TABLE bookings ALTER COLUMN "${column_name}" DROP NOT NULL`)
      .catch((err) => console.warn(`Drop NOT NULL ${column_name}:`, err.message));
  }

  // Step 3 — drop legacy FK on pod_id (old schema had pod_id REFERENCES pods(id))
  await pool.query(`ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_pod_id_fkey`)
    .catch((err) => console.warn("Drop FK warn:", err.message));

  // Step 4 — ensure status column always defaults to 'active' regardless of old schema
  await pool.query(`ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'active'`)
    .catch((err) => console.warn("Status default warn:", err.message));
}
initDB().catch(console.error);

// ==================== Test Route ====================
app.get("/", (req, res) => {
  res.send("Smart Pod backend is running");
});

// =============================================================
// ======================== USERS ===============================
// =============================================================

// Get all users (does NOT return password hashes)
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, full_name, birthday, preferred_modes FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sign up / create account
app.post("/api/signup", async (req, res) => {
  const { username, password, full_name, birthday, preferred_modes } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password are required",
    });
  }

  try {
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: "Username already exists",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (username, password_hash, full_name, birthday, preferred_modes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, full_name, birthday, preferred_modes
      `,
      [username, password_hash, full_name || null, birthday || null, preferred_modes || null]
    );

    const row = result.rows[0];
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: { ...row, birthday: formatDate(row.birthday), preferred_modes: fromModeArray(row.preferred_modes) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log in / check user credentials
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password are required",
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        birthday: formatDate(user.birthday),
        preferred_modes: fromModeArray(user.preferred_modes),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
app.put("/api/users/:id", async (req, res) => {
  const { full_name, birthday, preferred_modes } = req.body;
  console.log("PUT /api/users/:id", req.params.id, { full_name, birthday, preferred_modes });
  try {
    const result = await pool.query(
      `UPDATE users
       SET full_name = $1, birthday = $2, preferred_modes = $3
       WHERE id = $4
       RETURNING id, username, full_name, birthday, preferred_modes`,
      [full_name || null, birthday || null, toModeArray(preferred_modes), req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const row = result.rows[0];
    res.json({
      success: true,
      user: {
        ...row,
        birthday: row.birthday ? formatDate(row.birthday) : null,
        preferred_modes: fromModeArray(row.preferred_modes),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change password
app.put("/api/users/:id/password", async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ error: "current_password and new_password are required" });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const user = result.rows[0];
    const match = await bcrypt.compare(current_password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Current password is incorrect" });

    const new_hash = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [new_hash, req.params.id]);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete account
app.delete("/api/users/:id", async (req, res) => {
  try {
    // Remove bookings first (FK constraint)
    await pool.query("DELETE FROM bookings WHERE user_id = $1", [req.params.id]);
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active sessions (returns current user's login info — single session model)
app.get("/api/users/:id/sessions", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, full_name, created_at FROM users WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const user = result.rows[0];
    res.json([
      {
        id: "current",
        device: "Mobile App",
        location: "Current session",
        logged_in_at: new Date().toISOString(),
        is_current: true,
      },
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optional: keep your old create-user route for testing compatibility
// but now it hashes password safely instead of accepting password_hash directly
app.post("/api/users", async (req, res) => {
  const { username, password, full_name, birthday, preferred_modes } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password are required",
    });
  }

  try {
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: "Username already exists",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (username, password_hash, full_name, birthday, preferred_modes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, full_name, birthday, preferred_modes
      `,
      [username, password_hash, full_name || null, birthday || null, preferred_modes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// ========================= PODS ===============================
// =============================================================

app.get("/api/pods", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pods");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/pods", async (req, res) => {
  const { id, location, status, fan_speed, brightness, theme_id } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO pods (id, location, status, fan_speed, brightness, theme_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [id, location, status, fan_speed, brightness, theme_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single pod for ESP32 / frontend
app.get("/api/pods/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.location,
        p.status,
        p.fan_speed,
        p.theme_id,

        lp.brightness AS preset_brightness,
        lp.red        AS preset_red,
        lp.green      AS preset_green,
        lp.blue       AS preset_blue,
        lp.animation  AS preset_animation
      FROM pods p
      LEFT JOIN lighting_presets lp
        ON lp.id = p.theme_id
      WHERE p.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pod not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// ==================== LIGHTING MODE CONTROL ===================
// =============================================================

app.post("/api/pods/:id/mode", async (req, res) => {
  const { mode } = req.body;

  try {
    const preset = await pool.query(
      "SELECT id FROM lighting_presets WHERE id = $1",
      [mode]
    );

    if (preset.rows.length === 0) {
      return res.status(400).json({ error: "Unknown lighting preset id" });
    }

    const result = await pool.query(
      `
      UPDATE pods
      SET theme_id = $1
      WHERE id = $2
      RETURNING *
      `,
      [mode, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pod not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// ==================== FAN CONTROL ONLY ========================
// =============================================================

app.put("/api/pods/:id/hardware", async (req, res) => {
  let { fan_speed } = req.body;

  try {
    fan_speed = Number(fan_speed);
    if (!Number.isFinite(fan_speed)) fan_speed = 3;

    fan_speed = Math.max(1, Math.min(5, fan_speed));

    const result = await pool.query(
      `
      UPDATE pods
      SET fan_speed = $1
      WHERE id = $2
      RETURNING *
      `,
      [fan_speed, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pod not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// ==================== LIGHTING PRESETS ========================
// =============================================================

app.get("/api/lighting_presets", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM lighting_presets ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/lighting_presets", async (req, res) => {
  const { id, brightness, red, green, blue, animation } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO lighting_presets (id, brightness, red, green, blue, animation) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [id, brightness, red, green, blue, animation]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// ==================== POD -> APP / APP -> POD =================
// =============================================================

// Send a knock to a pod
app.post("/api/pods/:id/knock", async (req, res) => {
  const targetPodId = req.params.id;
  const { from_pod, from_user, pattern, duration_ms, color } = req.body;

  try {
    const podCheck = await pool.query(
      "SELECT id FROM pods WHERE id = $1",
      [targetPodId]
    );

    if (podCheck.rows.length === 0) {
      return res.status(404).json({ error: "Target pod not found" });
    }

    const topic = `pods/${targetPodId}/knock`;
    const payload = {
      type: "knock",
      from_pod: from_pod || "unknown",
      from_user: from_user || null,
      pattern: pattern || "pulse",
      duration_ms: Number(duration_ms) || 3000,
      color: color || null,
      timestamp: Date.now(),
    };

    await publishToIoT(topic, payload, 0);

    res.json({
      success: true,
      message: `Knock sent to ${targetPodId}`,
      topic,
      payload,
    });
  } catch (err) {
    console.error("Knock publish error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Send command payload directly to a pod
app.post("/api/pods/:id/sync-command", async (req, res) => {
  const targetPodId = req.params.id;
  const { fan_speed, brightness, theme_id, unlock } = req.body;

  try {
    const podCheck = await pool.query(
      "SELECT id FROM pods WHERE id = $1",
      [targetPodId]
    );

    if (podCheck.rows.length === 0) {
      return res.status(404).json({ error: "Target pod not found" });
    }

    const topic = `pods/${targetPodId}/commands`;
    const payload = {};

    if (fan_speed !== undefined) {
      const speed = Number(fan_speed);
      payload.fan_speed = Number.isFinite(speed)
        ? Math.max(1, Math.min(5, speed))
        : 1;
    }
    if (brightness !== undefined) payload.brightness = Number(brightness);
    if (theme_id !== undefined) payload.theme_id = theme_id;
    if (unlock !== undefined) payload.unlock = Boolean(unlock);

    await publishToIoT(topic, payload, 0);

    res.json({
      success: true,
      message: `Command sent to ${targetPodId}`,
      topic,
      payload,
    });
  } catch (err) {
    console.error("Command publish error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Publish current DB state to pod's commands topic
app.post("/api/pods/:id/push-state", async (req, res) => {
  const targetPodId = req.params.id;

  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.fan_speed,
        p.theme_id,
        lp.brightness AS brightness
      FROM pods p
      LEFT JOIN lighting_presets lp
        ON lp.id = p.theme_id
      WHERE p.id = $1
      `,
      [targetPodId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pod not found" });
    }

    const pod = result.rows[0];

    const topic = `pods/${targetPodId}/commands`;
    const payload = {
      fan_speed: pod.fan_speed,
      brightness: pod.brightness,
      theme_id: pod.theme_id,
    };

    await publishToIoT(topic, payload, 0);

    res.json({
      success: true,
      message: `State pushed to ${targetPodId}`,
      topic,
      payload,
    });
  } catch (err) {
    console.error("Push-state publish error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// ====================== BIRTHDAY CARDS ========================
// =============================================================

// GET /api/birthdays/today — users whose birthday is today (excluding self)
app.get("/api/birthdays/today", async (req, res) => {
  const { exclude_user_id } = req.query;
  try {
    const result = await pool.query(
      `SELECT id, username, full_name
       FROM users
       WHERE birthday IS NOT NULL
         AND to_char(birthday::date, 'MM-DD') = to_char(CURRENT_DATE, 'MM-DD')
       ${exclude_user_id ? "AND id != $1" : ""}`,
      exclude_user_id ? [exclude_user_id] : []
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/birthday-cards?to_user_id=X — cards received by a user
app.get("/api/birthday-cards", async (req, res) => {
  const { to_user_id } = req.query;
  if (!to_user_id) return res.status(400).json({ error: "to_user_id is required" });
  try {
    const result = await pool.query(
      `SELECT bc.id, bc.card_design, bc.message, bc.created_at,
              u.id AS from_id, u.full_name AS from_full_name, u.username AS from_username
       FROM birthday_cards bc
       JOIN users u ON u.id = bc.from_user_id
       WHERE bc.to_user_id = $1
       ORDER BY bc.created_at DESC`,
      [to_user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/birthday-cards — send a card
app.post("/api/birthday-cards", async (req, res) => {
  const { from_user_id, to_user_id, card_design, message } = req.body;
  if (!from_user_id || !to_user_id || !message) {
    return res.status(400).json({ error: "from_user_id, to_user_id and message are required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO birthday_cards (from_user_id, to_user_id, card_design, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [from_user_id, to_user_id, card_design || "1", message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// ======================== KNOCKS ==============================
// =============================================================

// POST /api/knocks — send a knock from one user to another
app.post("/api/knocks", async (req, res) => {
  const { from_user_id, to_user_id } = req.body;
  if (!from_user_id || !to_user_id) {
    return res.status(400).json({ error: "from_user_id and to_user_id are required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO knocks (from_user_id, to_user_id)
       VALUES ($1, $2) RETURNING *`,
      [from_user_id, to_user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/knocks?to_user_id=X — get undismissed knocks for a user
app.get("/api/knocks", async (req, res) => {
  const { to_user_id } = req.query;
  if (!to_user_id) return res.status(400).json({ error: "to_user_id is required" });
  try {
    const result = await pool.query(
      `SELECT k.id, k.created_at,
              u.id AS from_id, u.full_name AS from_full_name, u.username AS from_username
       FROM knocks k
       JOIN users u ON u.id = k.from_user_id
       WHERE k.to_user_id = $1 AND k.dismissed = FALSE
       ORDER BY k.created_at DESC`,
      [to_user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/knocks/:id/dismiss — dismiss a knock
app.put("/api/knocks/:id/dismiss", async (req, res) => {
  try {
    await pool.query("UPDATE knocks SET dismissed = TRUE WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// ====================== BOOKINGS ==============================
// =============================================================

// GET /api/bookings?user_id=X&filter=today|upcoming|cancelled&date=YYYY-MM-DD
app.get("/api/bookings", async (req, res) => {
  const { user_id, filter, date } = req.query;
  try {
    let whereClause = "WHERE 1=1";
    const params = [];

    if (user_id) {
      params.push(user_id);
      whereClause += ` AND user_id = $${params.length}`;
    }

    // Use client-supplied date to avoid server timezone mismatch
    const localDate = date || new Date().toISOString().split("T")[0];

    if (filter === "today") {
      params.push(localDate);
      whereClause += ` AND booking_date = $${params.length} AND status = 'active'`;
    } else if (filter === "upcoming") {
      params.push(localDate);
      whereClause += ` AND booking_date > $${params.length} AND status = 'active'`;
    } else if (filter === "cancelled") {
      whereClause += " AND status = 'cancelled'";
    } else {
      // Default (carousel): today + future active bookings only
      params.push(localDate);
      whereClause += ` AND booking_date >= $${params.length} AND status = 'active'`;
    }

    const result = await pool.query(
      `SELECT * FROM bookings ${whereClause} ORDER BY booking_date ASC, id ASC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings
app.post("/api/bookings", async (req, res) => {
  const { user_id, pod_id, pod_name, location, booking_date, time_label, people_count } = req.body;
  if (!pod_name) return res.status(400).json({ error: "pod_name is required" });
  try {
    const result = await pool.query(
      `INSERT INTO bookings (user_id, pod_id, pod_name, location, booking_date, time_label, people_count, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
       RETURNING *`,
      [user_id || null, pod_id || null, pod_name, location || null,
       booking_date || null, time_label || null, people_count || 1]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/booked-pods?date=YYYY-MM-DD&time_label=X
app.get("/api/bookings/booked-pods", async (req, res) => {
  const { date, time_label } = req.query;
  if (!date || !time_label) return res.status(400).json({ error: "date and time_label required" });
  try {
    const result = await pool.query(
      `SELECT pod_name FROM bookings
       WHERE booking_date = $1 AND time_label = $2 AND status = 'active'`,
      [date, time_label]
    );
    res.json(result.rows.map(r => r.pod_name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bookings/:id/cancel
app.put("/api/bookings/:id/cancel", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Booking not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// ======================== EVENTS ==============================
// =============================================================

// GET /api/events
app.get("/api/events", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM events ORDER BY created_at ASC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events
app.post("/api/events", async (req, res) => {
  const { title, date_label, icon, created_by } = req.body;
  if (!title) return res.status(400).json({ error: "title is required" });
  try {
    const result = await pool.query(
      `INSERT INTO events (title, date_label, icon, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, date_label || null, icon || "📅", created_by || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// ====================== START SERVER ==========================
// =============================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
