from __future__ import annotations

import json
import sqlite3
from datetime import date, datetime, time
from pathlib import Path
from typing import Any
import uuid

from flask import Flask, jsonify, render_template, request

from model import Category, FinanceRecord, PaymentMode, TransactionType
from queries import (
    CREATE_ACCOUNTS_TABLE,
    CREATE_FINANCE_RECORDS_TABLE,
    INSERT_ACCOUNT,
    INSERT_FINANCE_RECORD,
    SELECT_ACCOUNT_BY_NAME,
    SELECT_ALL_ACCOUNTS,
    SELECT_FINANCE_RECORDS,
    SELECT_RECENT_FINANCE_RECORDS,
)

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "zapisi.db"

app = Flask(__name__)


def get_db_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db() -> None:
    with get_db_connection() as connection:
        connection.execute(CREATE_ACCOUNTS_TABLE)
        connection.execute(CREATE_FINANCE_RECORDS_TABLE)


def parse_optional_date(raw_value: Any) -> date | None:
    if raw_value in (None, ""):
        return None
    if isinstance(raw_value, date):
        if isinstance(raw_value, datetime):
            return raw_value.date()
        return raw_value
    return date.fromisoformat(str(raw_value))


def parse_optional_datetime(raw_value: Any) -> datetime | None:
    if raw_value in (None, ""):
        return None
    if isinstance(raw_value, datetime):
        return raw_value
    if isinstance(raw_value, date):
        return datetime.combine(raw_value, time.min)

    raw_text = str(raw_value).strip()
    try:
        return datetime.fromisoformat(raw_text)
    except ValueError:
        return datetime.combine(date.fromisoformat(raw_text), time.min)


def require_non_empty_string(payload: dict[str, Any], field_name: str) -> str:
    value = str(payload.get(field_name, "")).strip()
    if not value:
        raise ValueError(f"{field_name} is required")
    return value


def fetch_accounts() -> list[dict[str, Any]]:
    with get_db_connection() as connection:
        rows = connection.execute(SELECT_ALL_ACCOUNTS).fetchall()
    return [dict(row) for row in rows]


def serialize_record(row: sqlite3.Row) -> dict[str, Any]:
    return dict(row)


def ensure_account(connection: sqlite3.Connection, account_name: str) -> dict[str, str]:
    normalized_name = account_name.strip()
    existing_account = connection.execute(
        SELECT_ACCOUNT_BY_NAME,
        (normalized_name,),
    ).fetchone()
    if existing_account:
        return dict(existing_account)

    today = date.today().isoformat()
    account_id = str(uuid.uuid4())
    connection.execute(
        INSERT_ACCOUNT,
        (account_id, normalized_name, today, today),
    )
    return {"id": account_id, "name": normalized_name}


def build_record(payload: dict[str, Any], account_id: str) -> FinanceRecord:
    now = datetime.now()
    created_at = parse_optional_datetime(payload.get("created_at")) or now

    return FinanceRecord(
        account_id=account_id,
        transaction_type=TransactionType(payload["transaction_type"]),
        amount=float(payload["amount"]),
        payment_mode=PaymentMode(payload["payment_mode"]),
        category=Category(payload["category"]),
        description=require_non_empty_string(payload, "description"),
        receiver=str(payload["receiver"]).strip() if payload.get("receiver") else None,
        currency=str(payload.get("currency") or "INR").strip(),
        subcategory=str(payload["subcategory"]).strip() if payload.get("subcategory") else None,
        official_txn_id=str(payload["official_txn_id"]).strip() if payload.get("official_txn_id") else None,
        created_at=created_at,
        updated_at=parse_optional_datetime(payload.get("updated_at")) or now,
    )


def insert_record(connection: sqlite3.Connection, record: FinanceRecord) -> None:
    connection.execute(
        INSERT_FINANCE_RECORD,
        (
            record.id,
            record.account_id,
            record.transaction_type.value,
            record.amount,
            record.payment_mode.value,
            record.category.value,
            record.description,
            record.receiver,
            record.currency,
            record.subcategory,
            record.official_txn_id,
            record.created_at.isoformat(),
            record.updated_at.isoformat(),
        ),
    )


def fetch_recent_records(limit: int = 10) -> list[dict[str, Any]]:
    with get_db_connection() as connection:
        rows = connection.execute(
            SELECT_RECENT_FINANCE_RECORDS,
            (limit,),
        ).fetchall()

    return [serialize_record(row) for row in rows]


def fetch_records() -> list[dict[str, Any]]:
    with get_db_connection() as connection:
        rows = connection.execute(SELECT_FINANCE_RECORDS).fetchall()

    return [serialize_record(row) for row in rows]


@app.get("/api/bootstrap")
def bootstrap():
    return jsonify(
        {
            "transaction_types": [item.value for item in TransactionType],
            "payment_modes": [item.value for item in PaymentMode],
            "categories": [item.value for item in Category],
            "accounts": fetch_accounts(),
            "records": fetch_records(),
            "recent_records": fetch_recent_records(12),
        }
    )


@app.post("/api/new")
def create_record():
    payload = request.get_json(silent=True)
    if payload is None:
        payload = request.form.to_dict()

    try:
        account_name = require_non_empty_string(payload, "account_name")
        with get_db_connection() as connection:
            account = ensure_account(connection, account_name)
            record = build_record(payload, account["id"])
            insert_record(connection, record)
    except KeyError as exc:
        return jsonify({"error": f"missing required field: {exc.args[0]}"}), 400
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except sqlite3.IntegrityError as exc:
        return jsonify({"error": f"database constraint failed: {exc}"}), 400

    return jsonify(
        {
            "message": "record created",
            "id": record.id,
            "record": {
                "id": record.id,
                "transaction_type": record.transaction_type.value,
                "amount": record.amount,
                "payment_mode": record.payment_mode.value,
                "category": record.category.value,
                "account_id": record.account_id,
                "account_name": account["name"],
                "description": record.description,
                "receiver": record.receiver,
                "currency": record.currency,
                "created_at": record.created_at.isoformat(),
            },
        }
    ), 201


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/records")
def records_page():
    return render_template("records.html")


init_db()


if __name__ == "__main__":
    app.run(debug=True)
