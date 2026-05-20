PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

-- 1. Modify categories table
-- Create new global categories table
CREATE TABLE IF NOT EXISTS categories_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER,
    FOREIGN KEY (parent_id) REFERENCES categories_new(id)
);

-- Copy data (excluding user_id)
INSERT INTO categories_new (id, name, parent_id)
SELECT id, name, parent_id FROM categories;

-- Drop old table and rename
DROP TABLE categories;
ALTER TABLE categories_new RENAME TO categories;

-- 2. Modify payment_modes table
-- Create new global payment_modes table
CREATE TABLE IF NOT EXISTS payment_modes_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Copy data (ensuring uniqueness)
INSERT OR IGNORE INTO payment_modes_new (id, name)
SELECT id, name FROM payment_modes;

-- Drop old table and rename
DROP TABLE payment_modes;
ALTER TABLE payment_modes_new RENAME TO payment_modes;

-- 3. Re-create transactions to ensure constraints are linked to new tables
CREATE TABLE IF NOT EXISTS transactions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    payment_mode_id INTEGER,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'INR',
    receiver_id INTEGER,
    category_id INTEGER,
    description TEXT,
    official_txn_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (payment_mode_id) REFERENCES payment_modes(id),
    FOREIGN KEY (receiver_id) REFERENCES merchants(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Copy transaction data
INSERT INTO transactions_new SELECT * FROM transactions;

-- Drop and rename
DROP TABLE transactions;
ALTER TABLE transactions_new RENAME TO transactions;

COMMIT;

PRAGMA foreign_keys = ON;
