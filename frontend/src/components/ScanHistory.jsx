function ScanHistory({ history, onClear }) {

  return (

    <section className="panel history-panel">

      <div className="panel-header">

        <div>

          <h2>Scan History</h2>

          <p>
            Previous vulnerability assessments
          </p>

        </div>


        {history.length > 0 && (

          <button
            className="clear-button"
            onClick={onClear}
          >
            Clear History
          </button>

        )}

      </div>


      {history.length === 0 ? (

        <div className="empty">
          No scan history yet.
        </div>

      ) : (

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>Timestamp</th>
                <th>Target</th>
                <th>Hosts</th>
                <th>Open Ports</th>
                <th>Filtered Ports</th>
                <th>Services</th>

              </tr>

            </thead>

            <tbody>

              {history.map((scan) => (

                <tr key={scan.id}>

                  <td>
                    {scan.timestamp}
                  </td>

                  <td>
                    {scan.target}
                  </td>

                  <td>
                    {scan.hosts}
                  </td>

                  <td>
                    {scan.open_ports}
                  </td>

                  <td>
                    {scan.filtered_ports}
                  </td>

                  <td>
                    {scan.services}
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


export default ScanHistory;