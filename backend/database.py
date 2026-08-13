import sqlite3
from datetime import datetime


DATABASE = "vulnscope.db"


def get_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def init_database():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            hosts INTEGER DEFAULT 0,
            open_ports INTEGER DEFAULT 0,
            filtered_ports INTEGER DEFAULT 0,
            services INTEGER DEFAULT 0
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scan_ports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_id INTEGER,
            host TEXT,
            port INTEGER,
            protocol TEXT,
            service TEXT,
            product TEXT,
            version TEXT,
            state TEXT,
            FOREIGN KEY(scan_id) REFERENCES scans(id)
        )
    """)

    connection.commit()
    connection.close()


def save_scan(target, result):

    connection = get_connection()

    cursor = connection.cursor()

    summary = result["summary"]

    timestamp = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    cursor.execute("""
        INSERT INTO scans
        (target, timestamp, hosts, open_ports,
         filtered_ports, services)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        target,
        timestamp,
        summary["hosts"],
        summary["open_ports"],
        summary["filtered_ports"],
        summary["services"]
    ))

    scan_id = cursor.lastrowid

    for host in result["hosts"]:

        for port in host["ports"]:

            cursor.execute("""
                INSERT INTO scan_ports
                (scan_id, host, port, protocol,
                 service, product, version, state)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                scan_id,
                host["host"],
                port["port"],
                port["protocol"],
                port["service"],
                port["product"],
                port["version"],
                port["state"]
            ))

    connection.commit()
    connection.close()

    return scan_id


def get_history():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM scans
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    connection.close()

    return [dict(row) for row in rows]


def get_scan(scan_id):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        "SELECT * FROM scans WHERE id = ?",
        (scan_id,)
    )

    scan = cursor.fetchone()

    cursor.execute(
        "SELECT * FROM scan_ports WHERE scan_id = ?",
        (scan_id,)
    )

    ports = cursor.fetchall()

    connection.close()

    if scan is None:
        return None

    result = dict(scan)

    result["ports"] = [dict(port) for port in ports]

    return result


def clear_history():

    connection = get_connection()

    cursor = connection.cursor

    cursor.execute("DELETE FROM scan_ports")
    cursor.execute("DELETE FROM scans")

    connection.commit()
    connection.close()