import React from "react";

function Team() {
  return (
    <div className="container my-5">
      <h2 className="text-center mb-5">People</h2>

      {/* Row Centered */}
      <div className="row justify-content-center align-items-center">
        
        {/* Left - Profile Image */}
        <div className="col-md-4 text-center">
          <img
            src="media/images/nithinKamath.jpg" // Replace with your image
            alt="Founder"
            className="rounded-circle img-fluid shadow"
            style={{ maxWidth: "250px" }}
          />
          <h5 className="mt-3">Dhruv Kuchekar</h5>
          <p className="text-muted">Founder, CEO</p>
        </div>

        {/* Right - Bio */}
        <div className="col-md-6">
          <p>
            Dhruv bootstrapped and founded <strong>Stockflow</strong> in 2025 to overcome
            the hurdles faced by traders in India. Today, Stockflow is transforming
            the trading experience with cutting-edge technology and transparent pricing.
          </p>
          <p>
            He is passionate about technology-driven financial solutions and
            believes in empowering traders with the best tools and resources.
          </p>
          <p>When not coding or trading, Dhruv enjoys basketball and music.</p>
          <p>
            Connect on{" "}
            <a href="#" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>{" "}
            /{" "}
            <a href="#" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>{" "}
            /{" "}
            <a href="#" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Team;
