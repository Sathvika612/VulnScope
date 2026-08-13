import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./App.css";

const API_URL = "http://127.0.0.1:5000";

function App() {
  const [target, setTarget] = useState("127.0.0.1");
  const [authorized, setAuthorized] = useState(true);

  const [scan, setScan] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load scan history
  const loadHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/history`);

      if (!response.ok) {
        throw new Error("Failed to load history");
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Start scan
  const handleScan = async () => {
    if (!target.trim()) {
      setError("Please enter a target.");
      return;
    }

    if (!authorized) {
      setError("Please confirm that you are authorized to assess this target.");
      return;
    }

    setLoading(true);
    setError("");
    setScan(null);

    try {
      const response = await fetch(`${API_URL}/api/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: target.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Scan failed");
      }

      setScan(data);

      // Refresh history after scan
      await loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear history
  const handleClearHistory = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear scan history?"
    );

    if (!confirmed) return;

    try {
      await fetch(`${API_URL}/api/history`, {
        method: "DELETE",
      });

      setHistory([]);
    } catch (err) {
      setError("Unable to clear history.");
    }
  };

  // Open an old scan
  const openScan = async (scanId) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/api/scan/${scanId}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load scan.");
      }

      setScan(data);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Download PDF
  const downloadReport = () => {
    if (!scan?.scan_id && !scan?.id) return;

    const id = scan.scan_id || scan.id;

    window.open(
      `${API_URL}/api/scan/${id}/report`,
      "_blank"
    );
  };

  // Download CSV
  const downloadCSV = () => {
    if (!scan?.scan_id && !scan?.id) return;

    const id = scan.scan_id || scan.id;

    window.open(
      `${API_URL}/api/scan/${id}/csv`,
      "_blank"
    );
  };

  // Get all ports from all hosts
  const allPorts = useMemo(() => {
    if (!scan?.hosts) return [];

    return scan.hosts.flatMap((host) =>
      (host.ports || []).map((port) => ({
        ...port,
        host: host.host,
      }))
    );
  }, [scan]);

  // Unique services
  const services = useMemo(() => {
    const serviceMap = new Map();

    allPorts.forEach((port) => {
      if (
        port.service &&
        port.service !== "Unknown"
      ) {
        if (!serviceMap.has(port.service)) {
          serviceMap.set(port.service, port);
        }
      }
    });

    return Array.from(serviceMap.values());
  }, [allPorts]);

  // Chart
  const chartData = useMemo(() => {
    if (!scan?.summary) return [];

    const open = scan.summary.open_ports || 0;
    const filtered = scan.summary.filtered_ports || 0;

    const closed =
      allPorts.filter(
        (port) => port.state === "closed"
      ).length;

    const data = [];

    if (open > 0) {
      data.push({
        name: "Open",
        value: open,
      });
    }

    if (filtered > 0) {
      data.push({
        name: "Filtered",
        value: filtered,
      });
    }

    if (closed > 0) {
      data.push({
        name: "Closed",
        value: closed,
      });
    }

    if (data.length === 0) {
      data.push({
        name: "No Ports",
        value: 1,
      });
    }

    return data;
  }, [scan, allPorts]);

  const chartColors = [
    "#2563eb",
    "#f59e0b",
    "#94a3b8",
  ];

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="brand-section">

          <div className="logo">
            V
          </div>

          <div>
            <h1>VulnScope</h1>
            <p>Nmap Vulnerability Assessment Dashboard</p>
          </div>

        </div>

        <div className="scanner-status">
          <span className="status-dot"></span>
          Scanner Online
        </div>
      </header>


      <main className="container">

        {/* SCAN SECTION */}
        <section className="card scan-card">

          <div className="section-heading">
            <div>
              <h2>Start Security Assessment</h2>
              <p>
                Scan an authorized IP address or hostname using Nmap.
              </p>
            </div>
          </div>

          <div className="scan-form">

            <div className="target-wrapper">

              <label htmlFor="target">
                Target
              </label>

              <input
                id="target"
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="127.0.0.1"
                disabled={loading}
              />

            </div>

            <button
              className="scan-button"
              onClick={handleScan}
              disabled={loading}
            >
              {loading ? "Scanning..." : "Scan"}
            </button>

          </div>

          <label className="authorization">
            <input
              type="checkbox"
              checked={authorized}
              onChange={(e) =>
                setAuthorized(e.target.checked)
              }
            />

            <span>
              I confirm that I am authorized to assess this target.
            </span>
          </label>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading && (
            <div className="scan-progress">
              <div className="spinner"></div>

              <div>
                <strong>Scanning target...</strong>
                <p>
                  Nmap is performing service detection. This may take a few moments.
                </p>
              </div>
            </div>
          )}

        </section>


        {/* RESULTS */}
        {scan && (
          <>

            {/* SUMMARY */}
            <section className="summary-grid">

              <SummaryCard
                title="Hosts Up"
                value={scan.summary?.hosts || 0}
                icon="◉"
              />

              <SummaryCard
                title="Open Ports"
                value={scan.summary?.open_ports || 0}
                icon="◈"
                highlight
              />

              <SummaryCard
                title="Filtered Ports"
                value={scan.summary?.filtered_ports || 0}
                icon="◇"
              />

              <SummaryCard
                title="Services"
                value={scan.summary?.services || 0}
                icon="◆"
              />

            </section>


            {/* RESULTS GRID */}
            <section className="results-grid">

              {/* HOST RESULTS */}
              <div className="card">

                <div className="card-title">
                  <div>
                    <h2>Host Results</h2>
                    <p>
                      Systems discovered during the scan
                    </p>
                  </div>
                </div>

                <div className="table-container">

                  <table>

                    <thead>
                      <tr>
                        <th>Host</th>
                        <th>OS</th>
                        <th>Status</th>
                        <th>Open Ports</th>
                      </tr>
                    </thead>

                    <tbody>

                      {scan.hosts?.map((host, index) => {

                        const openPorts =
                          (host.ports || []).filter(
                            (port) => port.state === "open"
                          ).length;

                        return (
                          <tr key={index}>

                            <td className="host-name">
                              {host.host}
                            </td>

                            <td>
                              {host.os || "Not detected"}
                            </td>

                            <td>
                              <span
                                className={
                                  host.status === "up"
                                    ? "badge success"
                                    : "badge"
                                }
                              >
                                {host.status}
                              </span>
                            </td>

                            <td>
                              <strong>
                                {openPorts}
                              </strong>
                            </td>

                          </tr>
                        );
                      })}

                    </tbody>

                  </table>

                </div>

              </div>


              {/* SERVICES */}
              <div className="card">

                <div className="card-title">
                  <div>
                    <h2>Services Detected</h2>
                    <p>
                      Network services discovered by Nmap
                    </p>
                  </div>
                </div>

                <div className="table-container">

                  <table>

                    <thead>
                      <tr>
                        <th>Port</th>
                        <th>Protocol</th>
                        <th>Service</th>
                        <th>State</th>
                      </tr>
                    </thead>

                    <tbody>

                      {services.length > 0 ? (

                        services.map((service, index) => (

                          <tr key={index}>

                            <td>
                              <strong>
                                {service.port}
                              </strong>
                            </td>

                            <td>
                              {service.protocol?.toUpperCase()}
                            </td>

                            <td>
                              {service.service}
                            </td>

                            <td>
                              <span className="badge success">
                                {service.state}
                              </span>
                            </td>

                          </tr>

                        ))

                      ) : (

                        <tr>
                          <td colSpan="4" className="empty">
                            No services detected.
                          </td>
                        </tr>

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </section>


            {/* PORTS + CHART */}
            <section className="lower-grid">

              {/* PORT TABLE */}
              <div className="card ports-card">

                <div className="card-title">
                  <div>
                    <h2>Port Details</h2>
                    <p>
                      Ports identified during the assessment
                    </p>
                  </div>
                </div>

                <div className="table-container">

                  <table>

                    <thead>
                      <tr>
                        <th>Port</th>
                        <th>Protocol</th>
                        <th>State</th>
                        <th>Service</th>
                        <th>Version</th>
                      </tr>
                    </thead>

                    <tbody>

                      {allPorts.map((port, index) => (

                        <tr key={index}>

                          <td>
                            <strong>
                              {port.port}
                            </strong>
                          </td>

                          <td>
                            {port.protocol?.toUpperCase()}
                          </td>

                          <td>

                            <span
                              className={
                                port.state === "open"
                                  ? "badge success"
                                  : port.state === "filtered"
                                  ? "badge warning"
                                  : "badge"
                              }
                            >
                              {port.state}
                            </span>

                          </td>

                          <td>
                            {port.service}
                          </td>

                          <td>
                            {port.version || "-"}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>


              {/* CHART */}
              <div className="card chart-card">

                <div className="card-title">
                  <div>
                    <h2>Port Status Distribution</h2>
                    <p>
                      Current scan result
                    </p>
                  </div>
                </div>

                <div className="chart">

                  <ResponsiveContainer
                    width="100%"
                    height={280}
                  >

                    <PieChart>

                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={3}
                      >

                        {chartData.map(
                          (entry, index) => (
                            <Cell
                              key={index}
                              fill={
                                chartColors[index % chartColors.length]
                              }
                            />
                          )
                        )}

                      </Pie>

                      <Tooltip />

                      <Legend />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </section>


            {/* ACTIONS */}
            <section className="actions">

              <button
                className="secondary-button"
                onClick={downloadReport}
              >
                Export PDF Report
              </button>

              <button
                className="secondary-button"
                onClick={downloadCSV}
              >
                Export CSV
              </button>

            </section>

          </>
        )}


        {/* HISTORY */}
        <section className="card history-card">

          <div className="history-header">

            <div>
              <h2>Scan History</h2>
              <p>
                Previous vulnerability assessments
              </p>
            </div>

            {history.length > 0 && (
              <button
                className="clear-button"
                onClick={handleClearHistory}
              >
                Clear History
              </button>
            )}

          </div>


          <div className="table-container">

            {history.length === 0 ? (

              <div className="empty-history">
                No scan history available.
              </div>

            ) : (

              <table>

                <thead>

                  <tr>
                    <th>Timestamp</th>
                    <th>Target</th>
                    <th>Hosts</th>
                    <th>Open Ports</th>
                    <th>Filtered Ports</th>
                    <th>Services</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {history.map((item, index) => (

                    <tr key={item.id || index}>

                      <td>
                        {item.timestamp}
                      </td>

                      <td className="host-name">
                        {item.target}
                      </td>

                      <td>
                        {item.hosts}
                      </td>

                      <td>
                        <strong>
                          {item.open_ports}
                        </strong>
                      </td>

                      <td>
                        {item.filtered_ports}
                      </td>

                      <td>
                        {item.services}
                      </td>

                      <td>
                        <button
                          className="view-button"
                          onClick={() =>
                            openScan(item.id)
                          }
                        >
                          View
                        </button>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </section>

      </main>


      <footer>
        <p>
          VulnScope • Nmap Vulnerability Assessment Dashboard
        </p>

        <span>
          Use only on systems you are authorized to assess.
        </span>
      </footer>

    </div>
  );
}


/* SUMMARY CARD */

function SummaryCard({
  title,
  value,
  icon,
  highlight = false,
}) {
  return (
    <div
      className={
        highlight
          ? "summary-card highlight"
          : "summary-card"
      }
    >

      <div className="summary-icon">
        {icon}
      </div>

      <div>
        <p>{title}</p>
        <h3>{value}</h3>
      </div>

    </div>
  );
}

export default App;