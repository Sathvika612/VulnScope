function SummaryCards({ summary }) {

  const cards = [

    {
      title: "Hosts Up",
      value: summary.hosts,
      icon: "🖥️"
    },

    {
      title: "Open Ports",
      value: summary.open_ports,
      icon: "🔓"
    },

    {
      title: "Filtered Ports",
      value: summary.filtered_ports,
      icon: "🛡️"
    },

    {
      title: "Services",
      value: summary.services,
      icon: "⚙️"
    }

  ];


  return (

    <div className="summary-grid">

      {cards.map((card) => (

        <div
          className="summary-card"
          key={card.title}
        >

          <div className="card-icon">
            {card.icon}
          </div>

          <div>

            <p>{card.title}</p>

            <h3>{card.value}</h3>

          </div>

        </div>

      ))}

    </div>

  );
}


export default SummaryCards;