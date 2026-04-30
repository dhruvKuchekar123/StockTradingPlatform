import React from "react";

function Education() {
  return (
    <div className="container my-5 py-5">
      <div className="row align-items-center">
        
        {/* Left Column - Image */}
        <div className="col-lg-6 col-md-12 text-center mb-4">
          <img
            src="media/images/education.svg"
            alt="Market Education"
            className="img-fluid"
            style={{ maxHeight: "350px" }}
          />
        </div>

        {/* Right Column - Text */}
        <div className="col-lg-6 col-md-12">
          <h2>Free and open market education</h2>

          <p className="text-muted mb-4" style={{ fontSize: "1.1rem" }}>
            Varsity, the largest online stock market education book in the world, 
            covering everything from the basics to advanced trading.
          </p>
          <a
            href=""
            className="d-inline-block mb-4"
            style={{
              textDecoration: "none",
              fontWeight: "500",
              color: "#007bff",
              fontSize: "1.1rem"
            }}
          >
            Varsity{" "}
            <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
          </a>

          <p className="text-muted mb-4" style={{ fontSize: "1.1rem" }}>
            TradingQ&A, the most active trading and investment community in India 
            for all your market-related queries.
          </p>
          <a
            href=""
            className="d-inline-block"
            style={{
              textDecoration: "none",
              fontWeight: "500",
              color: "#007bff",
              fontSize: "1.1rem"
            }}
          >
            TradingQ&A{" "}
            <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Education;
