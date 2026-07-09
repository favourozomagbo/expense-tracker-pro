from flask import Flask, render_template, request, jsonify
from database import get_db_connection, create_table
import os

app = Flask(__name__)
    

@app.route("/")
def home():
    return render_template("index.html")    

    
@app.route("/add_transaction", methods=["POST"])
def add_transaction():

    data = request.get_json()

    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute("""                  

INSERT INTO transactions
(title, amount, category, type, date)
                   
VALUES (?, ?, ?, ?, ?)
""", (

    data["title"],

    data["amount"],

    data["category"],

    data["type"],

    data["date"]

    ))
    conn.commit()

    conn.close()

    return jsonify({
        "message": "Transaction added successfully!"
    })

@app.route("/transactions")
def get_transactions():

    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute("SELECT * FROM transactions ORDER BY id DESC")

    transactions = cursor.fetchall()

    conn.close()

    return jsonify([dict(transaction) for transaction in transactions])

@app.route("/update_transaction/<int:id>", methods=["POST"])
def update_transaction(id):

    data = request.get_json()

    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute("""
        UPDATE transactions
        SET title = ?,
            amount = ?,
            category = ?,
            type = ?,
            date = ?
        WHERE id = ?
    """, (

        data["title"],
        data["amount"],
        data["category"],
        data["type"],
        data["date"],
        id

    ))

    conn.commit()

    conn.close()

    return jsonify({
        "message": "Transaction updated successfully!"
    })


@app.route("/delete_transaction/<int:id>", methods=["DELETE"])
def delete_transaction(id):

    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute("""

        DELETE FROM transactions

        WHERE id = ?

    """, (id,))

    conn.commit()

    conn.close()

    return jsonify({
        "message": "Transaction deleted successfully!"
    })

import os

if __name__ == "__main__":
    create_table()
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=True
    )

