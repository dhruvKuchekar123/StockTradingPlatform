import React from "react";

function Hero() {
  return (
    <div
      className="container-fluid border-bottom mb-5 mt-5"
      style={{
        background: "linear-gradient(135deg, #f5f9ff, #e8f1ff)",
      }}
    >
      <div className="container text-center py-5">
        <h1 className="fw-bold display-5 text-dark">Stockflow Products</h1>
        <h3 className="text-muted mt-3 fs-4">
          Sleek, modern, and intuitive trading platforms
        </h3>

        <p className="mt-4 fs-5">
          Check out our{" "}
          <a
            href="#"
            style={{ textDecoration: "none", color: "#387ed1" }}
            className="fw-semibold"
          >
            investment offerings{" "}
            <i className="fa fa-long-arrow-right ms-1" aria-hidden="true"></i>
          </a>
        </p>
      </div>
    </div>
  );
}

export default Hero;
