import React from "react";

function Hero() {
  return (
    <section className="container-fluid" id="supportHero">
      {/* Top Bar */}
      <div id="supportWrapper" className="p-4 ">
        <h5 className="mb-0 fw-bold">Support Portal</h5>
        <a
          href="#"
          style={{
            backgroundColor: "white",
            color: "rgb(56, 126, 209)",
            padding: "6px 16px",
            borderRadius: "20px",
            fontWeight: "500",
            textDecoration: "none",
          }}
        >
          Track Tickets
        </a>
      </div>

      {/* Main Content */}
      <div className="row p-5">
        {/* Left Section */}
        <div className="col-md-6 mb-4">
          <h1 className="fs-4 fw-bold mb-3">
            Search for an answer or browse help topics to create a ticket
          </h1>
          <div className="mb-3">
            <input
              type="search"
              className="form-control p-3"
              placeholder="Eg: How do I open my account, how do I activate F&O..."
            />
          </div>
          <div className="d-flex flex-wrap gap-3 mt-4">
            <a href="#" className="small">Track account opening</a>
            <a href="#" className="small">Track segment activation</a>
            <a href="#" className="small">Intraday margins</a>
            <a href="#" className="small">Kite user manual</a>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-md-6">
          <h1 className="fs-4 fw-bold mb-3">Featured</h1>
          <ol className="ps-3">
            <li className="mb-2">
              <a href="#">Current Takeovers and Delisting - January 2024</a>
            </li>
            <li>
              <a href="#">Latest Intraday Margin - January 2024</a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default Hero;
