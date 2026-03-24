require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcrypt");
const {
  IoTDataPlaneClient,
  PublishCommand,
} = require("@aws-sdk/client-iot-data-plane");

const app = express();
app.use(cors());
app.use(express.json());

// ==================== Database Connection ====================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==================== AWS IoT Connection ====================
const iotClient = new IoTDataPlaneClient({
  region: process.env.AWS_REGION,
  endpoint: `https://${process.env.AWS_IOT_DATA_ENDPOINT}`,
});

async function publishToIoT(topic, payload, qos = 0) {
  const command = new PublishCommand({
    topic,
    qos,
    payload: Buffer.from(JSON.stringify(payload)),
  });

  await iotClient.send(command);
}

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

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: result.rows[0],
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
        birthday: user.birthday,
        preferred_modes: user.preferred_modes,
      },
    });
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

    fan_speed = Math.max(3, Math.min(5, fan_speed));

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

    if (fan_speed !== undefined) payload.fan_speed = Number(fan_speed);
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
// ====================== START SERVER ==========================
// =============================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});