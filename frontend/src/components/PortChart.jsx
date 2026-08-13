import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";


function PortChart({ hosts }) {

  let open = 0;
  let filtered = 0;
  let closed = 0;


  hosts.forEach((host) => {

    host.ports.forEach((port) => {

      if (port.state === "open") {
        open++;
      }

      else if (port.state === "filtered") {
        filtered++;
      }

      else if (port.state === "closed") {
        closed++;
      }

    });

  });


  const data = [

    {
      name: "Open",
      value: open
    },

    {
      name: "Filtered",
      value: filtered
    },

    {
      name: "Closed",
      value: closed
    }

  ];


  return (

    <section className="panel chart-panel">

      <div className="panel-header">

        <h2>Port Status Distribution</h2>

      </div>


      <div className="chart-container">

        <PieChart width={350} height={280}>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            label
          >

            {data.map((entry, index) => (

              <Cell
                key={index}
                fill={
                  ["#2563eb", "#f59e0b", "#94a3b8"][index]
                }
              />

            ))}

          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>

      </div>

    </section>

  );
}


export default PortChart;