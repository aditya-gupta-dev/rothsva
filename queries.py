CREATE_ACCOUNTS_TABLE = """
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
)
"""


CREATE_FINANCE_RECORDS_TABLE = """
CREATE TABLE IF NOT EXISTS finance_records (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (
        transaction_type IN (
            'expense',
            'income'
        )
    ),
    amount REAL NOT NULL,
    payment_mode TEXT NOT NULL CHECK (
        payment_mode IN (
            'cash',
            'UPI',
            'card',
            'netbanking',
            'wallet',
            'crypto',
            'other'
        )
    ),
    category TEXT NOT NULL CHECK (
        category IN (
            'food',
            'travel',
            'study',
            'rent',
            'medical',
            'entertainment',
            'personal',
            'income',
            'misc'
        )
    ),
    description TEXT NOT NULL,
    receiver TEXT,
    currency TEXT NOT NULL DEFAULT 'INR',
    subcategory TEXT,
    official_txn_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
)
"""


INSERT_ACCOUNT = """
INSERT INTO accounts (
    id,
    name,
    created_at,
    updated_at
) VALUES (?, ?, ?, ?)
"""


SELECT_ACCOUNT_BY_NAME = """
SELECT id, name
FROM accounts
WHERE name = ?
"""


SELECT_ALL_ACCOUNTS = """
SELECT id, name
FROM accounts
ORDER BY name ASC
"""


INSERT_FINANCE_RECORD = """
INSERT INTO finance_records (
    id,
    account_id,
    transaction_type,
    amount,
    payment_mode,
    category,
    description,
    receiver,
    currency,
    subcategory,
    official_txn_id,
    created_at,
    updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
"""


SELECT_FINANCE_RECORDS = """
SELECT
    finance_records.id,
    finance_records.account_id,
    accounts.name AS account_name,
    finance_records.transaction_type,
    finance_records.amount,
    finance_records.payment_mode,
    finance_records.category,
    finance_records.description,
    finance_records.receiver,
    finance_records.currency,
    finance_records.subcategory,
    finance_records.official_txn_id,
    finance_records.created_at,
    finance_records.updated_at
FROM finance_records
JOIN accounts ON accounts.id = finance_records.account_id
ORDER BY finance_records.created_at DESC, finance_records.rowid DESC
"""


SELECT_RECENT_FINANCE_RECORDS = """
SELECT
    finance_records.id,
    finance_records.account_id,
    accounts.name AS account_name,
    finance_records.transaction_type,
    finance_records.amount,
    finance_records.payment_mode,
    finance_records.category,
    finance_records.description,
    finance_records.receiver,
    finance_records.currency,
    finance_records.subcategory,
    finance_records.official_txn_id,
    finance_records.created_at,
    finance_records.updated_at
FROM finance_records
JOIN accounts ON accounts.id = finance_records.account_id
ORDER BY finance_records.created_at DESC, finance_records.rowid DESC
LIMIT ?
"""
