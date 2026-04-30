import React from "react";

function Universe() {
  const partners = [
    {
      img: "media/images/zerodhaFundhouse.png",
      desc: "Our asset management venture that is creating simple and transparent index funds to help you save for your goals."
    },
    {
      img: "media/images/sensibullLogo.svg",
      desc: "Options trading platform that lets you create strategies, analyze positions, and examine data points like open interest, FII/DII, and more."
    },
    {
      img: "media/images/smallcaseLogo.png",
      desc: "Thematic investing platform that helps you invest in diversified baskets of stocks on ETFs."
    },
    {
      img: "media/images/dittoLogo.png",
      desc: "Personalized advice on life and health insurance. No spam and no mis-selling."
    },
    {
      img: "media/images/streakLogo.png",
      desc: "Systematic trading platform that allows you to create and backtest strategies without coding."
    },
    {
      img: "media/images/goldenpiLogo.png",
      desc: "Bonds trading platform."
    }
  ];

  return (
    <div className="container text-center my-5">
      <h1 className="fw-bold mb-3">The Stockflow Universe</h1>
      <p className="text-muted fs-5 mb-5">
        Extend your trading and investment experience even further with our partner platforms
      </p>

      <div className="row g-4 mb-5">
        {partners.map((partner, index) => (
          <div className="col-12 col-sm-6 col-md-4" key={index}>
            <div className="p-4 h-100 border rounded shadow-sm hover-shadow">
              <img
                src={partner.img}
                alt="Partner Logo"
                className="img-fluid mb-3"
                style={{ maxHeight: "60px", objectFit: "contain" }}
              />
              <p className="text-muted small">{partner.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sign Up Button */}
      <a
        href="#"
        className="btn btn-primary btn-lg px-5"
        style={{
          backgroundColor: "#387ed1",
          border: "none",
          borderRadius: "4px",
          fontWeight: "600"
        }}
      >
        Sign up now
      </a>
    </div>
  );
}

export default Universe;
