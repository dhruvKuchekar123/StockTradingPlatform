import React from 'react';

function Pricing() {
  return (
    <div className="container my-5 py-5">
      <div className="row align-items-center">
        {/* Left Section */}
        <div className="col-lg-5 col-md-12 mb-4">
          <h2 className="fw-bold mb-3">Unbeatable pricing</h2>
          <p style={{ fontSize: "1.1rem", color: "#555" }}>
            We pioneered the concept of discount broking and price transparency in India.
            Flat fees and no hidden charges.
          </p>

          <a
            href=""
            style={{
              textDecoration: "none",
              fontWeight: "500",
              color: "#007bff",
              fontSize: "1.1rem"
            }}
          >
            See pricing{" "}
            <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
          </a>
        </div>

        {/* Right Section */}
        <div className="col-lg-7 col-md-12 d-flex justify-content-between text-center">
          <div>
            <h1 style={{ color: "#ff9800", fontWeight: "bold" }}>₹0</h1>
            <p style={{ color: "#555" }}>Free account opening</p>
          </div>
          <div>
            <h1 style={{ color: "#ff9800", fontWeight: "bold" }}>₹0</h1>
            <p style={{ color: "#555" }}>Free equity delivery and direct mutual funds</p>
          </div>
          <div>
            <h1 style={{ color: "#ff9800", fontWeight: "bold" }}>₹20</h1>
            <p style={{ color: "#555" }}>Intraday and F&O</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
