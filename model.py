from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional
from enum import Enum
import uuid


class TransactionType(str, Enum):
    EXPENSE         = "expense"
    INCOME          = "income"


class PaymentMode(str, Enum):
    CASH       = "cash"
    UPI        = "UPI"
    CARD       = "card"
    NETBANKING = "netbanking"
    WALLET     = "wallet"
    CRYPTO     = "crypto"
    OTHER      = "other" 


class Category(str, Enum):
    FOOD           = "food"
    TRAVEL         = "travel"
    STUDY          = "study"
    RENT           = "rent"
    MEDICAL        = "medical"
    ENTERTAINMENT  = "entertainment"
    PERSONAL       = "personal"
    INCOME         = "income"
    MISC           = "misc"


@dataclass
class FinanceRecord:
    account_id:        str
    transaction_type: TransactionType
    amount:           float
    payment_mode:     PaymentMode
    category:         Category
    description:      str
    receiver:         Optional[str]        = None

    currency:         str                  = "INR"
    subcategory:      Optional[str]        = None
    official_txn_id:  Optional[str]        = None   

    created_at:       datetime             = field(default_factory=datetime.now)
    updated_at:       datetime             = field(default_factory=datetime.now)
    id:               str                  = field(default_factory=lambda: str(uuid.uuid4()))

    def to_csv_row(self) -> dict:
        """Flatten the record to a dict suitable for csv.DictWriter."""
        return {
            "id":               self.id,
            "account_id":       self.account_id,
            "amount":           self.amount,
            "currency":         self.currency,
            "transaction_type": self.transaction_type.value,
            "payment_mode":     self.payment_mode.value,
            "official_txn_id":  self.official_txn_id or "",
            "category":         self.category.value,
            "subcategory":      self.subcategory or "",
            "description":      self.description,
            "receiver":         self.receiver or "",
            "created_at":       self.created_at.isoformat(),
            "updated_at":       self.updated_at.isoformat(),
        }
    

    @classmethod
    def from_csv_row(cls, row: dict) -> "FinanceRecord":
        """Reconstruct a FinanceRecord from a csv.DictReader row."""
        return cls(
            id               = row["id"],
            account_id       = row["account_id"],
            amount           = float(row["amount"]),
            currency         = row["currency"],
            transaction_type = TransactionType(row["transaction_type"]),
            payment_mode     = PaymentMode(row["payment_mode"]),
            official_txn_id  = row["official_txn_id"] or None,
            category         = Category(row["category"]),
            subcategory      = row["subcategory"] or None,
            description      = row["description"],
            receiver         = row["receiver"] or None,
            created_at       = datetime.fromisoformat(row["created_at"]),
            updated_at       = datetime.fromisoformat(row["updated_at"]),
        )


    @classmethod
    def csv_fieldnames(cls) -> list[str]:
        return [
            "id", "account_id", "amount", "currency", "transaction_type", "payment_mode",
            "official_txn_id", "category", "subcategory", "description", "receiver",
            "created_at", "updated_at",
        ]
