import sqlite3


def get_db_connection():

    conn = sqlite3.connect("expenses.db")

    conn.row_factory = sqlite3.Row

    return conn


def create_table():

    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions(

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            title TEXT NOT NULL,

            amount REAL NOT NULL,

            category TEXT NOT NULL,

            type TEXT NOT NULL,

            date TEXT NOT NULL

        )
    """)

    conn.commit()

    conn.close()