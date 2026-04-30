import React from 'react';

function Hero() {
  return (
    <div className="container my-5">
      {/* Heading Section */}
      <div className="row py-5 mt-5 mb-5 bg-light rounded shadow-sm">
        <h2 className="fs-3 fw-bold text-center text-primary">
          We pioneered the discount broking model in India.
          <br />
          Now, we are breaking ground with our technology.
        </h2>
      </div>

      {/* Info Section */}
      <div className="row py-5 mt-5 border-top">
        {/* Left Column */}
        <div className="col-md-6 pe-5">
          <p className="lead">
            We kick-started operations on the{" "}
            <strong className="text-primary">15th of August, 2010</strong> with the
            goal of breaking all barriers that traders and investors face in
            India in terms of cost, support, and technology. We named the company{" "}
            <strong className="text-primary">Stockflow</strong>, a combination of
            "Stock" and "Flow".
          </p>
          <p>
            Today, our disruptive pricing models and in-house technology have
            made us the <strong>biggest stock broker in India</strong>.
          </p>
          <p>
            Over <strong>1.6+ crore clients</strong> place billions of orders
            every year through our powerful ecosystem of investment platforms,
            contributing over 15% of all Indian retail trading volumes.
          </p>
        </div>

        {/* Right Column */}
        <div className="col-md-6 ps-5 border-start">
          <p>
            In addition, we run a number of popular open online educational and
            community initiatives to empower retail traders and investors.
          </p>
          <p>
            <strong>Rainmatter</strong>, our fintech fund and incubator, has
            invested in several fintech startups with the goal of growing the
            Indian capital markets.
          </p>
          <p>
            And yet, we are always up to something new every day. Catch up on the{" "}
            <a href="#" className="text-decoration-none text-primary fw-bold">
              latest updates
            </a>{" "}
            on our blog, see what the media is saying about us, or learn more
            about our business and product philosophies.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hero;
