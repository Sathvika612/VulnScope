import subprocess
import xml.etree.ElementTree as ET
import ipaddress
import re


def validate_target(target):
    target = target.strip()

    if not target:
        raise ValueError("Target cannot be empty.")

    # Allow IP address
    try:
        ipaddress.ip_address(target)
        return target
    except ValueError:
        pass

    # Allow CIDR network
    try:
        ipaddress.ip_network(target, strict=False)
        return target
    except ValueError:
        pass

    # Allow simple hostnames
    hostname_pattern = r"^[a-zA-Z0-9.-]+$"

    if re.match(hostname_pattern, target):
        return target

    raise ValueError("Invalid target format.")


def run_nmap(target):
    target = validate_target(target)

    command = [
        "nmap",
        "-sV",
        "-T3",
        "-oX",
        "-",
        target
    ]

    try:
        process = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=300,
            shell=False
        )
    except FileNotFoundError:
        raise RuntimeError(
            "Nmap was not found. Please install Nmap and add it to PATH."
        )
    except subprocess.TimeoutExpired:
        raise RuntimeError("Nmap scan timed out.")

    if process.returncode != 0:
        raise RuntimeError(process.stderr.strip() or "Nmap scan failed.")

    return parse_nmap_xml(process.stdout)


def parse_nmap_xml(xml_data):
    root = ET.fromstring(xml_data)

    hosts = []
    total_open = 0
    total_filtered = 0
    services = set()

    for host in root.findall("host"):

        status_element = host.find("status")

        status = "unknown"

        if status_element is not None:
            status = status_element.attrib.get("state", "unknown")

        addresses = host.findall("address")

        host_address = "Unknown"

        for address in addresses:
            if address.attrib.get("addrtype") == "ipv4":
                host_address = address.attrib.get("addr")
                break

        if host_address == "Unknown" and addresses:
            host_address = addresses[0].attrib.get("addr", "Unknown")

        hostname = ""

        hostnames = host.find("hostnames")

        if hostnames is not None:
            hostname_element = hostnames.find("hostname")

            if hostname_element is not None:
                hostname = hostname_element.attrib.get("name", "")

        ports = []

        ports_element = host.find("ports")

        if ports_element is not None:

            for port in ports_element.findall("port"):

                port_number = port.attrib.get("portid")
                protocol = port.attrib.get("protocol")

                state_element = port.find("state")

                state = "unknown"

                if state_element is not None:
                    state = state_element.attrib.get(
                        "state",
                        "unknown"
                    )

                service_element = port.find("service")

                service_name = "Unknown"
                product = ""
                version = ""

                if service_element is not None:
                    service_name = service_element.attrib.get(
                        "name",
                        "Unknown"
                    )

                    product = service_element.attrib.get(
                        "product",
                        ""
                    )

                    version = service_element.attrib.get(
                        "version",
                        ""
                    )

                port_data = {
                    "port": int(port_number),
                    "protocol": protocol,
                    "state": state,
                    "service": service_name,
                    "product": product,
                    "version": version
                }

                ports.append(port_data)

                if state == "open":
                    total_open += 1

                elif state == "filtered":
                    total_filtered += 1

                if service_name != "Unknown":
                    services.add(service_name)

        hosts.append({
            "host": host_address,
            "hostname": hostname,
            "status": status,
            "os": "Not detected",
            "ports": ports
        })

    return {
        "hosts": hosts,
        "summary": {
            "hosts": len(hosts),
            "open_ports": total_open,
            "filtered_ports": total_filtered,
            "services": len(services)
        }
    }