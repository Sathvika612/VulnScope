function ServicesTable({ hosts }) {

  const services = [];

  hosts.forEach((host) => {

    host.ports.forEach((port) => {

      services.push({
        host: host.host,
        ...port
      });

    });

  });


  return (

    <section className="panel">

      <div className="panel-header">

        <h2>Services Detected</h2>

        <span>
          {services.length} services
        </span>

      </div>


      <div className="table-wrapper">

        <table>

          <thead>

            <tr>

              <th>Host</th>
              <th>Port</th>
              <th>Protocol</th>
              <th>Service</th>
              <th>Product</th>
              <th>Version</th>
              <th>Status</th>

            </tr>

          </thead>

          <tbody>

            {services.length === 0 ? (

              <tr>

                <td colSpan="7">
                  No services detected.
                </td>

              </tr>

            ) : (

              services.map((service, index) => (

                <tr key={index}>

                  <td>{service.host}</td>

                  <td>
                    {service.port}
                  </td>

                  <td>
                    {service.protocol}
                  </td>

                  <td>
                    {service.service}
                  </td>

                  <td>
                    {service.product || "-"}
                  </td>

                  <td>
                    {service.version || "-"}
                  </td>

                  <td>

                    <span className="port-status">
                      {service.state}
                    </span>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </section>

  );
}


export default ServicesTable;