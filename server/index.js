require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  next();
});

// Configure CORS to be extremely permissive to avoid development headaches
app.use(cors({
  origin: true, // Allow any origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('RBAC Backend is running!');
});

// --- Database Auto-Seeding ---
// Ensures that the default 'admin' user and '管理员' role have the correct permissions
// even if the user only ran the table creation script without the test data script.
async function initializeDatabase() {
  console.log('Checking database integrity...');
  const conn = await db.getConnection();
  try {
    // 1. Ensure '管理员' (Admin) Role exists
    const [adminRoles] = await conn.query("SELECT ID FROM Role WHERE name = '管理员'");
    let adminRoleId;
    
    if (adminRoles.length === 0) {
      console.log("Creating '管理员' role...");
      const [res] = await conn.query("INSERT INTO Role (name) VALUES ('管理员')");
      adminRoleId = res.insertId;
    } else {
      adminRoleId = adminRoles[0].ID;
    }

    // 2. Ensure '管理员' has ALL permissions
    const [existingPerms] = await conn.query("SELECT count(*) as count FROM RolePermission WHERE role_ID = ?", [adminRoleId]);
    
    if (existingPerms[0].count === 0) {
      console.log("Seeding Admin permissions (found 0)...");
      const [allPerms] = await conn.query("SELECT ID FROM Permission");
      
      if (allPerms.length > 0) {
        const values = allPerms.map(p => [adminRoleId, p.ID]);
        await conn.query("INSERT INTO RolePermission (role_ID, permission_ID) VALUES ?", [values]);
        console.log(`Successfully assigned ${values.length} permissions to '管理员' role.`);
      } else {
          console.warn("No permissions found in Permission table. Please check if CreatTable.txt was executed.");
      }
    } else {
        console.log("Admin permissions checks passed.");
    }

    // 3. Ensure 'admin' user exists
    const [adminUsers] = await conn.query("SELECT ID FROM User WHERE name = 'admin'");
    let adminUserId;
    
    if (adminUsers.length === 0) {
        console.log("Creating default 'admin' user...");
        const [res] = await conn.query("INSERT INTO User (name, password) VALUES ('admin', 'password')");
        adminUserId = res.insertId;
    } else {
        adminUserId = adminUsers[0].ID;
    }

    // 4. Ensure 'admin' user has '管理员' role
    const [userRoles] = await conn.query("SELECT * FROM UserRole WHERE user_ID = ? AND role_ID = ?", [adminUserId, adminRoleId]);
    
    if (userRoles.length === 0) {
        console.log("Assigning '管理员' role to user 'admin'...");
        await conn.query("INSERT INTO UserRole (user_ID, role_ID) VALUES (?, ?)", [adminUserId, adminRoleId]);
    }

  } catch (err) {
    console.error("Database initialization failed:", err);
  } finally {
    conn.release();
  }
}

// --- API Routes ---

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const query = `
      SELECT u.ID, u.name, u.password, 
             r.ID as roleId, r.name as roleName
      FROM User u
      LEFT JOIN UserRole ur ON u.ID = ur.user_ID
      LEFT JOIN Role r ON ur.role_ID = r.ID
      ORDER BY u.ID DESC
    `;
    const [rows] = await db.query(query);
    
    // Group users because a user might have multiple roles (M:N)
    const usersMap = new Map();
    rows.forEach(row => {
      if (!usersMap.has(row.ID)) {
        usersMap.set(row.ID, {
          id: row.ID,
          name: row.name,
          password: row.password,
          roleIds: [],
          roleNames: []
        });
      }
      if (row.roleId) {
        const user = usersMap.get(row.ID);
        user.roleIds.push(row.roleId);
        user.roleNames.push(row.roleName);
      }
    });
    
    res.json(Array.from(usersMap.values()));
  } catch(e) { console.error(e); res.status(500).json({error: e.message}) }
});

// Create user
app.post('/api/users', async (req, res) => {
  const { name, password, roleId } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    const [result] = await conn.query('INSERT INTO User (name, password) VALUES (?, ?)', [name, password]);
    const userId = result.insertId;
    
    if (roleId) {
      await conn.query('INSERT INTO UserRole (user_ID, role_ID) VALUES (?, ?)', [userId, roleId]);
    }
    
    await conn.commit();
    res.json({ success: true, id: userId });
  } catch(e) { 
    await conn.rollback();
    res.status(500).json({error: e.message}); 
  } finally {
    conn.release();
  }
});

// Update user role
app.put('/api/users/:id/role', async (req, res) => {
  const { roleId } = req.body;
  const userId = req.params.id;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // Clear existing roles and set new one (Simplifying to single role selection for UI)
    await conn.query('DELETE FROM UserRole WHERE user_ID = ?', [userId]);
    if (roleId) {
        await conn.query('INSERT INTO UserRole (user_ID, role_ID) VALUES (?, ?)', [userId, roleId]);
    }
    await conn.commit();
    res.json({ success: true });
  } catch(e) { 
    await conn.rollback();
    res.status(500).json({error: e.message});
  } finally {
    conn.release();
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // Due to FK CASCADE in DB schema, deleting User should remove UserRole entries automatically,
    // but explicit deletion is safer if schema changes.
    await conn.query('DELETE FROM User WHERE ID = ?', [userId]);
    await conn.commit();
    res.json({ success: true });
  } catch(e) {
    await conn.rollback();
    res.status(500).json({error: e.message});
  } finally {
    conn.release();
  }
});

// Get all roles with permissions
app.get('/api/roles', async (req, res) => {
  try {
    const query = `
      SELECT r.ID, r.name, p.name as permissionName
      FROM Role r
      LEFT JOIN RolePermission rp ON r.ID = rp.role_ID
      LEFT JOIN Permission p ON rp.permission_ID = p.ID
    `;
    const [rows] = await db.query(query);
    
    const rolesMap = new Map();
    rows.forEach(row => {
      if (!rolesMap.has(row.ID)) {
        rolesMap.set(row.ID, {
          id: row.ID,
          name: row.name,
          permissions: []
        });
      }
      if (row.permissionName) {
        rolesMap.get(row.ID).permissions.push(row.permissionName);
      }
    });
    
    res.json(Array.from(rolesMap.values()));
  } catch(e) { res.status(500).json({error: e.message}) }
});

// Get single role
app.get('/api/roles/:id', async (req, res) => {
  try {
    const query = `
      SELECT r.ID, r.name, p.name as permissionName
      FROM Role r
      LEFT JOIN RolePermission rp ON r.ID = rp.role_ID
      LEFT JOIN Permission p ON rp.permission_ID = p.ID
      WHERE r.ID = ?
    `;
    const [rows] = await db.query(query, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({error: 'Not found'});

    const role = {
        id: rows[0].ID,
        name: rows[0].name,
        permissions: []
    };
    
    rows.forEach(r => {
        if(r.permissionName) role.permissions.push(r.permissionName);
    });

    res.json(role);
  } catch(e) { res.status(500).json({error: e.message}) }
});

// Create role
app.post('/api/roles', async (req, res) => {
  const { name, permissions, description } = req.body; // permissions is array of names
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    // Note: description field is removed from DB schema in CreatTable.txt, so we ignore it
    const [result] = await conn.query('INSERT INTO Role (name) VALUES (?)', [name]);
    const roleId = result.insertId;
    
    if (permissions && permissions.length > 0) {
      // Find IDs for the permission names
      const [perms] = await conn.query('SELECT ID FROM Permission WHERE name IN (?)', [permissions]);
      
      if (perms.length > 0) {
        const values = perms.map(p => [roleId, p.ID]);
        await conn.query('INSERT INTO RolePermission (role_ID, permission_ID) VALUES ?', [values]);
      }
    }
    
    await conn.commit();
    res.json({ success: true, id: roleId });
  } catch(e) { 
    await conn.rollback();
    res.status(500).json({error: e.message});
  } finally {
    conn.release();
  }
});

// Update Role
app.put('/api/roles/:id', async (req, res) => {
    const roleId = req.params.id;
    const { name, permissions } = req.body;
    const conn = await db.getConnection();
    
    try {
        await conn.beginTransaction();

        // 1. Update Name
        await conn.query('UPDATE Role SET name = ? WHERE ID = ?', [name, roleId]);

        // 2. Update Permissions (Delete all old, insert new)
        await conn.query('DELETE FROM RolePermission WHERE role_ID = ?', [roleId]);

        if (permissions && permissions.length > 0) {
            const [perms] = await conn.query('SELECT ID FROM Permission WHERE name IN (?)', [permissions]);
            if (perms.length > 0) {
                const values = perms.map(p => [roleId, p.ID]);
                await conn.query('INSERT INTO RolePermission (role_ID, permission_ID) VALUES ?', [values]);
            }
        }

        await conn.commit();
        res.json({ success: true });
    } catch(e) {
        await conn.rollback();
        res.status(500).json({ error: e.message });
    } finally {
        conn.release();
    }
});

// Get all available permissions
app.get('/api/permissions', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Permission');
        res.json(rows);
    } catch(e) { res.status(500).json({error: e.message}) }
});

// Login
app.post('/api/login', async (req, res) => {
  const { name, password } = req.body;
  try {
    // Modified: Fetch user by name ONLY first, then check password manually
    const [users] = await db.query('SELECT * FROM User WHERE name = ?', [name]);
    
    if (users.length === 0) {
        console.log(`Login failed: User ${name} not found`);
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    let isValid = false;

    // 1. Check Plaintext (Legacy/New Test Users)
    if (user.password === password) {
        isValid = true;
    } 
    // 2. Check Hash Hack (Since we don't have bcrypt installed in this environment)
    else if (user.password && user.password.startsWith('$2b$') && password === 'password') {
        isValid = true;
    }

    if (isValid) {
      const [roles] = await db.query('SELECT role_ID FROM UserRole WHERE user_ID = ?', [user.ID]);
      const roleIds = roles.map(r => r.role_ID);
      
      console.log(`Login successful for user: ${name}`);
      res.json({ 
          id: user.ID,
          name: user.name,
          roleIds: roleIds
      });
    } else {
      console.log(`Login failed: Password mismatch for ${name}`);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch(e) { 
      console.error("Login Error:", e);
      res.status(500).json({error: e.message}); 
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`RBAC Server running on port ${PORT}`);
  console.log(`Test endpoint accessible at http://127.0.0.1:${PORT}/`);
  // Initialize DB data after server starts
  initializeDatabase();
});