import React from 'react'

function Stats() {
    return ( 
        <div className="container mt-5 py-5">
      <div className="row align-items-center">

        {/* left Column - Text */}
        <div className="col-lg-6 col-md-12">
          <h1 className="fw-bold mb-4 text-primary">
            Largest Stock Broker in India
          </h1>

          <div className="mb-4">
            <h4>Trust with confidance</h4>
            <br/>   
            <h4 className="fw-semibold">Customer-first always</h4>
            <p className="text-muted">
              That's why <b>1.6+ crore customers</b> trust <b>StockFlow</b> with ~ ₹6 lakh crores 
              of equity investments, making us India’s largest broker; contributing to 
              15% of daily retail exchange volumes in India.
            </p>
          </div>

          <div className="mb-4">
            <h4 className="fw-semibold">No spam or gimmicks</h4>
            <p className="text-muted">
              No gimmicks, spam, "gamification", or annoying push notifications. 
              High-quality apps that you use at your pace, the way you like.
            </p>
          </div>

          <div className="mb-4">
            <h4 className="fw-semibold">The StockFlow Universe</h4>
            <p className="text-muted">
              Not just an app, but a whole ecosystem. Our investments in 30+ 
              fintech startups offer you tailored services specific to your needs.
            </p>
          </div>

          <div className="mb-4">
            <h4 className="fw-semibold">Do better with money</h4>
            <p className="text-muted">
              With initiatives like <b>Nudge</b> and <b>Kill Switch</b>, we don't just 
              facilitate transactions, but actively help you do better with your money.
            </p>
          </div>
           <img src='media/images/pressLogos.png'/>
        </div>


         {/* Right Column - Image */}
        <div className="col-lg-6 col-md-12 text-center mb-4">
          <img
            src="media/images/ecosystem.png"
            alt="Largest Broker"
            className="img-fluid"
            style={{ maxHeight: "550px" }}
          />
         <div className="text-center">
  <a
    href=""
    className="mx-5"
    style={{ textDecoration: "none" }}
  >
    Explore Our Products{" "}
    <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
  </a>

  <a
    href=""
    style={{ textDecoration: "none" }}
  >
    Try Kite demo{" "}
    <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
  </a>
</div>

        </div>
      </div>
    </div>
     );
}

export default Stats;