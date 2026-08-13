from flask import (
    Flask,
    request,
    jsonify,
    send_file
)

from flask_cors import CORS

from scanner import run_nmap
from database import (
    init_database,
    save_scan,
    get_history,
    get_scan,
    clear_history
)

from report import generate_report

import csv
import io


app = Flask(__name__)

CORS(app)

init_database()


@app.route("/")
def home():

    return jsonify({
        "message": "VulnScope API is running"
    })


@app.route("/api/scan", methods=["POST"])
def scan():

    data = request.get_json()

    if not data or "target" not in data:

        return jsonify({
            "error": "Target is required"
        }), 400

    target = data["target"].strip()

    try:

        result = run_nmap(target)

        scan_id = save_scan(
            target,
            result
        )

        result["scan_id"] = scan_id
        result["target"] = target

        return jsonify(result)

    except ValueError as error:

        return jsonify({
            "error": str(error)
        }), 400

    except RuntimeError as error:

        return jsonify({
            "error": str(error)
        }), 500

    except Exception as error:

        print(error)

        return jsonify({
            "error": "An unexpected error occurred."
        }), 500


@app.route("/api/history")
def history():

    return jsonify(
        get_history()
    )


@app.route("/api/scan/<int:scan_id>")
def scan_details(scan_id):

    result = get_scan(scan_id)

    if result is None:

        return jsonify({
            "error": "Scan not found"
        }), 404

    return jsonify(result)


@app.route("/api/history", methods=["DELETE"])
def delete_history():

    clear_history()

    return jsonify({
        "message": "Scan history cleared"
    })


@app.route("/api/scan/<int:scan_id>/report")
def scan_report(scan_id):

    scan = get_scan(scan_id)

    if scan is None:

        return jsonify({
            "error": "Scan not found"
        }), 404

    filename = generate_report(scan)

    return send_file(
        filename,
        as_attachment=True,
        download_name=filename
    )


@app.route("/api/scan/<int:scan_id>/csv")
def scan_csv(scan_id):

    scan = get_scan(scan_id)

    if scan is None:

        return jsonify({
            "error": "Scan not found"
        }), 404

    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "Host",
        "Port",
        "Protocol",
        "Service",
        "Product",
        "Version",
        "State"
    ])

    for port in scan["ports"]:

        writer.writerow([
            port["host"],
            port["port"],
            port["protocol"],
            port["service"],
            port["product"],
            port["version"],
            port["state"]
        ])

    output.seek(0)

    return send_file(
        io.BytesIO(
            output.getvalue().encode()
        ),
        mimetype="text/csv",
        as_attachment=True,
        download_name=f"scan_{scan_id}.csv"
    )


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )