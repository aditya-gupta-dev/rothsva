users
    -id int autoincrement
    -name
    -password(hashed)
    -email 

add any other field if you want to. 
expected behaviour - login into their account from frontend and they should stay logged in for 1 month. and ill add a login button, use hono

each user can have many transactions each transaction has these field
    -transaction id int autoincrement
    -user_id (which account made this transaction)
    -transaction_type (credit/debit only two)
    -payment_mode (different mode of payment e.g. UPI, CASH, CARD)
    -amount (money e.g. 102.12)
    -currency (currency in short form e.g. INR)
    -reciever (the one who recieved the payment e.g. Ice cream vendor)
    -category (category where money spend e.g. food)
    -sub-category (sub category where money spend e.g. in food -> dinner)
    -desc (a description for this payment e.g. like the name of the ice-cream)
    -other metadata created_at, updated_at 
    -offical_txn_id (the transaction id e.g. the actual UPI transaction id)


    