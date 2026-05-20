users
    id INTEGER PRIMARY KEY AUTOINCREMENT
    name TEXT NOT NULL
    email TEXT UNIQUE NOT NULL
    password_hash TEXT NOT NULL
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    updated_at DATETIME

payment_modes (global defaults)
    id INTEGER PRIMARY KEY AUTOINCREMENT
    name TEXT NOT NULL UNIQUE (e.g. UPI, CASH, CARD)

categories (hierarchical)
    id INTEGER PRIMARY KEY AUTOINCREMENT
    name TEXT NOT NULL
    parent_id INTEGER (FK → categories.id, NULL = main category)
    user_id INTEGER (FK → users.id, NULL = global default)
    merchants (receiver)
    id INTEGER PRIMARY KEY AUTOINCREMENT
    name TEXT NOT NULL UNIQUE

transactions
    id INTEGER PRIMARY KEY AUTOINCREMENT
    user_id INTEGER NOT NULL (FK → users.id)
    transaction_type TEXT NOT NULL
    (CHECK: 'credit' OR 'debit')
    payment_mode_id INTEGER (FK → payment_modes.id)
    amount DECIMAL(12,2) NOT NULL
    currency TEXT DEFAULT 'INR'
    receiver_id INTEGER (FK → merchants.id)
    category_id INTEGER (FK → categories.id)
    description TEXT
    official_txn_id TEXT
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    updated_at DATETIME

