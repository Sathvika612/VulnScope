function Header() {

  return (

    <header className="header">

      <div className="brand">

        <div className="logo">
          V
        </div>

        <div>
          <h1>VulnScope</h1>

          <p>
            Nmap Vulnerability Assessment Dashboard
          </p>
        </div>

      </div>

      <div className="status">

        <span className="status-dot"></span>

        Scanner Online

      </div>

    </header>

  );
}


export default Header;