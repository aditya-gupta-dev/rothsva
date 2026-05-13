import sqlite3
import app

QUERY = """SELECT * FROM accounts""".strip()

conn = sqlite3.connect(app.DATABASE_PATH)
conn.row_factory = sqlite3.Row

rows = conn.execute(QUERY)

for row in rows.fetchall():
    print(dict(row)) 
