import { useState } from "react";


function ScanBox({ onScan, loading }) {

  const [target, setTarget] = useState("127.0.0.1");

  const [authorized, setAuthorized] = useState(false);


  const handleSubmit = (event) => {

    event.preventDefault();

    if (!authorized) {

      alert(
        "Please confirm that you are authorized to scan this target."
      );

      return;

    }

    if (!target.trim()) {

      alert("Please enter a target.");

      return;

    }

    onScan(target.trim());

  };


  return (

    <section className="scan-box">

      <div className="scan-heading">

        <div>

          <h2>Start Security Assessment</h2>

          <p>
            Scan an authorized IP address or hostname using Nmap.
          </p>

        </div>

      </div>


      <form onSubmit={handleSubmit}>

        <label>
          Target
        </label>

        <div className="scan-input-row">

          <input
            value={target}
            onChange={(event) =>
              setTarget(event.target.value)
            }
            placeholder="192.168.1.1"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
          >

            {loading ? "Scanning..." : "Scan"}

          </button>

        </div>


        <label className="authorization">

          <input
            type="checkbox"
            checked={authorized}
            onChange={(event) =>
              setAuthorized(event.target.checked)
            }
          />

          I confirm that I am authorized to assess this target.

        </label>

      </form>

    </section>

  );
}


export default ScanBox;