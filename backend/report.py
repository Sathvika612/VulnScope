from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet


def generate_report(scan):

    filename = f"scan_report_{scan['id']}.pdf"

    document = SimpleDocTemplate(
        filename,
        pagesize=A4
    )

    styles = getSampleStyleSheet()

    content = []

    content.append(
        Paragraph(
            "VulnScope",
            styles["Title"]
        )
    )

    content.append(
        Paragraph(
            "Nmap Vulnerability Assessment Report",
            styles["Heading2"]
        )
    )

    content.append(Spacer(1, 20))

    content.append(
        Paragraph(
            f"<b>Target:</b> {scan['target']}",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            f"<b>Scan Date:</b> {scan['timestamp']}",
            styles["Normal"]
        )
    )

    content.append(Spacer(1, 20))

    content.append(
        Paragraph(
            "Summary Statistics",
            styles["Heading2"]
        )
    )

    summary_data = [
        ["Metric", "Value"],
        ["Hosts", scan["hosts"]],
        ["Open Ports", scan["open_ports"]],
        ["Filtered Ports", scan["filtered_ports"]],
        ["Services", scan["services"]]
    ]

    table = Table(summary_data)

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 1, colors.grey),
            ("PADDING", (0, 0), (-1, -1), 6)
        ])
    )

    content.append(table)

    content.append(Spacer(1, 20))

    content.append(
        Paragraph(
            "Detected Services",
            styles["Heading2"]
        )
    )

    service_data = [
        [
            "Host",
            "Port",
            "Protocol",
            "Service",
            "Version",
            "State"
        ]
    ]

    for port in scan["ports"]:

        service_data.append([
            port["host"],
            port["port"],
            port["protocol"],
            port["service"],
            port["version"] or "-",
            port["state"]
        ])

    if len(service_data) == 1:
        service_data.append(
            ["-", "-", "-", "No services detected", "-", "-"]
        )

    service_table = Table(
        service_data,
        repeatRows=1
    )

    service_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("PADDING", (0, 0), (-1, -1), 5)
        ])
    )

    content.append(service_table)

    document.build(content)

    return filename