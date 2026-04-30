import React, { useState } from "react";

function CreateTickit() {
  const [openIndex, setOpenIndex] = useState(null);

  const sections = [
    {
      title: "Account Opening",
      links: [
        "Resident individual",
        "Minor",
        "Non Resident Indian (NRI)",
        "Company, Partnership, HUF and LLP",
        "Glossary",
      ],
    },
    {
      title: "Investments",
      links: ["Stocks", "Mutual Funds", "Bonds", "ETFs", "Gold"],
    },
    {
      title: "Trading",
      links: ["Equity", "Futures & Options", "Commodities", "Currency", "IPO"],
    },
    {
      title: "Support",
      links: ["Help Center", "Contact Us", "Live Chat", "FAQs", "Feedback"],
    },
    {
      title: "Settings",
      links: ["Profile", "Security", "Notifications", "Preferences", "Privacy"],
    },
    {
      title: "Resources",
      links: [
        "Learning Hub",
        "Webinars",
        "Market News",
        "Case Studies",
        "Downloads",
      ],
    },
  ];

  return (
    <div className="container py-5 my-5">
      <h1 className="fs-4 text-center mb-5">
        To create a ticket, select a relevant topic
      </h1>

      <div className="row g-4">
        {sections.map((section, index) => (
          <div key={index} className="col-12 col-md-4">
            <div className="border rounded shadow-sm h-100">
              {/* Header */}
              <div
                className="d-flex justify-content-between align-items-center p-3"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              >
                <div className="fw-semibold">{section.title}</div>
                <div
                  className={`transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  style={{ color: "#1976d2" }}
                >
                  {openIndex === index ? "▲" : "＋"}
                </div>
              </div>

              {/* Dropdown Content */}
              {openIndex === index && (
                <ul className="list-unstyled ps-4 pb-3 mb-0">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className="text-primary text-decoration-none small"
                      >
                        • {link}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CreateTickit;
