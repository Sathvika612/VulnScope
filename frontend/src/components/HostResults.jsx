function HostResults({ hosts }) {

  return (

    <section className="panel">

      <div className="panel-header">

        <h2>Host Results</h2>

      </div>


      {hosts.length === 0 ? (

        <div className="empty">
          No hosts found.
        </div>

      ) : (

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>Host</th>
                <th>Hostname</th>
                <th>Status</th>
                <th>Open Ports</th>

              </tr>

            </thead>

            <tbody>

              {hosts.map((host) => (

                <tr key={host.host}>

                  <td>{host.host}</td>

                  <td>
                    {host.hostname || "-"}
                  </td>

                  <td>

                    <span className="status-badge">
                      {host.status}
                    </span>

                  </td>

                  <td>

                    {host.ports
                      .filter(
                        (port) => port.state === "open"
                      )
                      .map(
                        (port) => port.port
                      )
                      .join(", ") || "-"}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </section>

  );
}


export default HostResults;