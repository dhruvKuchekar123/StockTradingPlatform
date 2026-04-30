import React, { useState } from "react";

const BrokerageTable = ({ headers, rows }) => (
    <div className="table-responsive my-4">
        <table
            className="table table-bordered align-middle"
            style={{
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 8px #f7f7fa",
            }}
        >
            <thead className="table-light text-center">
                <tr>
                    {headers.map((header, idx) => (
                        <th key={idx}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

function Brokerage() {
    const [activeTab, setActiveTab] = useState("equity");

    const tabs = [
        { id: "equity", label: "Equity" },
        { id: "currency", label: "Currency" },
        { id: "commodity", label: "Commodity" },
    ];

    const equityData = {
        headers: [
            "",
            "Equity delivery",
            "Equity intraday",
            "F&O - Futures",
            "F&O - Options",
        ],
        rows: [
            [
                <b>Brokerage</b>,
                "Zero Brokerage",
                "0.03% or Rs. 20/executed order whichever is lower",
                "0.03% or Rs. 20/executed order whichever is lower",
                "Flat Rs. 20 per executed order",
            ],
            [
                <b>STT/CTT</b>,
                "0.1% on buy & sell",
                "0.025% on the sell side",
                "0.02% on the sell side",
                <ul className="mb-0 ps-3 text-start">
                    <li>0.125% of the intrinsic value on options bought and exercised</li>
                    <li>0.1% on sell side (on premium)</li>
                </ul>,
            ],
            [
                <b>Transaction charges</b>,
                <>
                    NSE: 0.00297% <br /> BSE: 0.00375%
                </>,
                <>
                    NSE: 0.00297% <br /> BSE: 0.00375%
                </>,
                <>
                    NSE: 0.00173% <br /> BSE: 0
                </>,
                <>
                    NSE: 0.03503% (on premium) <br /> BSE: 0.0325% (on premium)
                </>,
            ],
            [
                <b>GST</b>,
                "18% on (brokerage + SEBI charges + transaction charges)",
                "18% on (brokerage + SEBI charges + transaction charges)",
                "18% on (brokerage + SEBI charges + transaction charges)",
                "18% on (brokerage + SEBI charges + transaction charges)",
            ],
            [
                <b>SEBI charges</b>,
                "₹10 / crore",
                "₹10 / crore",
                "₹10 / crore",
                "₹10 / crore",
            ],
        ],
    };

    const currencyData = {
        headers: ["", "Currency futures", "Currency options"],
        rows: [
            [
                <b>Brokerage</b>,
                "0.03% or ₹20/executed order whichever is lower",
                "₹20/executed order",
            ],
            [<b>STT/CTT</b>, "No STT", "No STT"],
            [
                <b>Transaction charges</b>,
                <>
                    NSE: 0.00035% <br /> BSE: 0.00045%
                </>,
                <>
                    NSE: 0.0311% <br /> BSE: 0.001%
                </>,
            ],
            [
                <b>GST</b>,
                "18% on (brokerage + SEBI charges + transaction charges)",
                "18% on (brokerage + SEBI charges + transaction charges)",
            ],
            [<b>SEBI charges</b>, "₹10 / crore", "₹10 / crore"],
            [
                <b>Stamp charges</b>,
                "0.0001% or ₹10 / crore on buy side",
                "0.0001% or ₹10 / crore on buy side",
            ],
        ],
    };

    const commodityData = {
        headers: ["Commodity futures", "Commodity options"],
        rows: [
            [
                "0.03% or Rs. 20/executed order whichever is lower",
                "₹20/executed order",
            ],
            ["0.01% on sell side (Non-Agri)", "0.05% on sell side"],
            [
                <>
                    MCX: 0.0021% <br /> NSE: 0.0001%
                </>,
                <>
                    MCX: 0.0418% <br /> NSE: 0.001%
                </>,
            ],
            [
                "18% on (brokerage + SEBI charges + transaction charges)",
                "18% on (brokerage + SEBI charges + transaction charges)",
            ],
            [
                <>
                    <strong>Agri:</strong> ₹1 / crore <br />
                    <strong>Non-agri:</strong> ₹10 / crore
                </>,
                "₹10 / crore",
            ],
            ["0.002% or ₹200 / crore on buy side", "0.003% or ₹300 / crore on buy side"],
        ],
    };

    return (
        <div className="container text-center">
            {/* Tabs */}
            <div className="row border-bottom mt-5 pb-3 justify-content-center">
                <div className="col-auto">
                    {tabs.map((tab) => (
                        <span
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                fontSize: "2rem",
                                fontWeight: activeTab === tab.id ? "700" : "400",
                                color: activeTab === tab.id ? "#3076d1" : "#444",
                                borderBottom:
                                    activeTab === tab.id ? "2px solid #3076d1" : "none",
                                marginRight: 36,
                                cursor: "pointer",
                            }}
                        >
                            {tab.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content */}
            {activeTab === "equity" && (
                <BrokerageTable headers={equityData.headers} rows={equityData.rows} />
            )}
            {activeTab === "currency" && (
                <BrokerageTable headers={currencyData.headers} rows={currencyData.rows} />
            )}
            {activeTab === "commodity" && (
                <BrokerageTable
                    headers={commodityData.headers}
                    rows={commodityData.rows}
                />
            )}

            <div className="container my-5 ">
                <h5 className="fw-semibold mb-4 ">Charges Explained</h5>
                <div className="row g-5">
                    {/* Left Column */}
                    <div className="col-lg-6 text-start">
                        <section className="mb-3  pb-2">
                            <h6 className="fw-semibold small">Securities / Commodities Transaction Tax (STT/CTT)</h6>
                            <p className="text-muted small mb-0">
                                Tax by the government when transacting on exchanges. Charged on buy & sell for equity delivery, only on sell for intraday/F&O.
                                <br /> STT/CTT can exceed brokerage—important to track.
                            </p>
                        </section>

                        <section className="mb-3  pb-2">
                            <h6 className="fw-semibold small">Transaction / Turnover Charges</h6>
                            <p className="text-muted small mb-1">Charged by exchanges (NSE, BSE, MCX) on transaction value:</p>
                            <ul className="text-muted small mb-0">
                                <li>BSE XC, XD, XT, Z, ZP: ₹10,000/crore</li>
                                <li>SS, ST: ₹1,00,000/crore</li>
                                <li>A, B, non-exclusive: ₹375/crore</li>
                                <li>M, MT, TS, MS: ₹275/crore</li>
                            </ul>
                        </section>

                        <section className="mb-3 pb-2">
                            <h6 className="fw-semibold small">Call & Trade</h6>
                            <p className="text-muted small mb-0">₹50/order via dealer, incl. auto square-off.</p>
                        </section>

                        <section className="mb-3  pb-2">
                            <h6 className="fw-semibold small">Stamp Charges</h6>
                            <p className="text-muted small mb-0">Govt. levy as per Indian Stamp Act 1899.</p>
                        </section>

                        <section className="mb-3  pb-2">
                            <h6 className="fw-semibold small">NRI Brokerage Charges</h6>
                            <ul className="text-muted small mb-0">
                                <li>₹100/order for F&O</li>
                                <li>Non-PIS: 0.5% or ₹100/order (equity)</li>
                                <li>PIS: 0.5% or ₹200/order (equity)</li>
                                <li>₹500 + GST AMC yearly</li>
                            </ul>
                        </section>

                        <section className="mb-3 pb-2">
                            <h6 className="fw-semibold small">Account with Debit Balance</h6>
                            <p className="text-muted small mb-0">₹40/order if account is in debit balance.</p>
                        </section>

                        <section className="mb-3  pb-2">
                            <h6 className="fw-semibold small">Investor Protection Fund Trust (IPFT) by NSE</h6>
                            <ul className="text-muted small mb-0">
                                <li>Equity & Futures: ₹10/crore + GST</li>
                                <li>Options: ₹50/crore + GST of premium</li>
                                <li>Currency: ₹0.05/lakh (Futures), ₹2/lakh (Options) + GST</li>
                            </ul>
                        </section>

                        <section>
                            <h6 className="fw-semibold small">Margin Trading Facility (MTF)</h6>
                            <ul className="text-muted small mb-0">
                                <li>Interest: 0.04%/day from T+1 until sale</li>
                                <li>Brokerage: 0.3% or ₹20/order</li>
                                <li>Pledge charge: ₹15 + GST per ISIN</li>
                            </ul>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="col-lg-6 text-start">
                        <section className="mb-3  pb-2">
                            <h6 className="fw-semibold small">GST</h6>
                            <p className="text-muted small mb-0">18% on (brokerage + SEBI + transaction charges).</p>
                        </section>

                        <section className="mb-3 b pb-2">
                            <h6 className="fw-semibold small">SEBI Charges</h6>
                            <p className="text-muted small mb-0">₹10/crore + GST for market regulation.</p>
                        </section>

                        <section className="mb-3  pb-2">
                            <h6 className="fw-semibold small">DP Charges</h6>
                            <p className="text-muted small mb-0">
                                ₹15.34/scrip on sell (incl. CDSL & Zerodha fee + GST).
                                Female accounts & MF/bonds get ₹0.25 discount on CDSL fee.
                            </p>
                        </section>

                        <section className="mb-3  pb-2">
                            <h6 className="fw-semibold small">Pledging Charges</h6>
                            <p className="text-muted small mb-0">₹30 + GST per pledge request per ISIN.</p>
                        </section>

                        <section className="mb-3  pb-2">
                            <h6 className="fw-semibold small">AMC</h6>
                            <p className="text-muted small mb-0">
                                BSDA: ₹0 if holdings  ₹4,00,000.
                                Non-BSDA: ₹300/year + GST (quarterly billing).
                            </p>
                        </section>

                        <section className="mb-3  pb-2">
                            <h6 className="fw-semibold small">Corporate Action Orders</h6>
                            <p className="text-muted small mb-0">₹20 + GST for OFS/buyback/takeover/delisting orders.</p>
                        </section>

                        <section className="mb-3 m pb-2">
                            <h6 className="fw-semibold small">Off-Market Transfer</h6>
                            <p className="text-muted small mb-0">₹25 per transaction.</p>
                        </section>

                        <section className="mb-3  pb-2">
                            <h6 className="fw-semibold small">Physical CMR Request</h6>
                            <p className="text-muted small mb-0">
                                First request free.
                                Subsequent: ₹20 + ₹100 courier + GST.
                            </p>
                        </section>

                        <section className="mb-3 pb-2">
                            <h6 className="fw-semibold small">Delayed Payment Charges</h6>
                            <p className="text-muted small mb-0">18%/year or 0.05%/day on debit balance.</p>
                        </section>

                        <section>
                            <h6 className="fw-semibold small">Trading via 3-in-1 Block Account</h6>
                            <ul className="text-muted small mb-0">
                                <li>Delivery & MTF: 0.5%/order</li>
                                <li>Intraday: 0.05%/order</li>
                            </ul>
                        </section>
                    </div>
                </div>

                <h6 className="mt-4 text-muted fw-semibold small">Disclaimer</h6>
                <p className="text-muted small mb-0">
                    Minimum ₹0.01 per contract note for delivery. Physical contract notes: ₹20 + courier.
                    Brokerage capped as per SEBI/exchange norms. Charges apply to expired, exercised, assigned options.
                    Retail free investment applies to individuals only; other entities pay 0.1% or ₹20 (whichever less) for delivery.
                    Physically settled contracts: 0.25% of contract value. Netted-off: 0.1% brokerage.
                </p>
            </div>

        </div>
    );
}

export default Brokerage;
