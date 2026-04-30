import React from 'react';

function Footer() {
  const linkStyle = { textDecoration: "none", color: "black", opacity: 0.8 };
  const listItemStyle = { marginBottom: "8px" };
  const textStyle = { fontSize: "14px", color: "#000", opacity: 0.6, lineHeight: "1.6" };

  return (
    <footer style={{ backgroundColor: "#f8f9fa", padding: "50px 0", borderTop: "1px solid #ddd" }}>
      <div className='container'>
        <div className='row' style={{ rowGap: "30px" }}>

          {/* Column 1 */}
          <div className='col'>
            <img src="media/images/stock logo.png" style={{ width: "50%", marginBottom: "15px" }} alt="Logo" />
            <p style={textStyle}>
              © 2010 - 2025, Stockflow Broking Ltd. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: "15px", marginBottom: "10px" }}>
              <a href="#" style={{ ...linkStyle, fontSize: "18px" }}><i className="fa-brands fa-x-twitter"></i></a>
              <a href="#" style={{ ...linkStyle, fontSize: "18px" }}><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" style={{ ...linkStyle, fontSize: "18px" }}><i className="fa-brands fa-instagram"></i></a>
              <a href="#" style={{ ...linkStyle, fontSize: "18px" }}><i className="fa-brands fa-square-linkedin"></i></a>
            </div>
            <div style={{ display: "flex", gap: "15px" }}>
              <a href="#" style={{ ...linkStyle, fontSize: "18px" }}><i className="fa-brands fa-youtube"></i></a>
              <a href="#" style={{ ...linkStyle, fontSize: "18px" }}><i className="fa-brands fa-whatsapp"></i></a>
              <a href="#" style={{ ...linkStyle, fontSize: "18px" }}><i className="fa-brands fa-telegram"></i></a>
            </div>
          </div>

          {/* Column 2 */}
          <div className='col'>
            <h6 style={{ fontWeight: "bold", marginBottom: "10px" }}>Account</h6>
            <ul style={{ listStyle: "none", padding: 0, fontSize: "14px", opacity: 0.8 }}>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Open demat account</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Minor demat account</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>NRI demat account</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Commodity</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Dematerialisation</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Fund transfer</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Referral program</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className='col'>
            <h6 style={{ fontWeight: "bold", marginBottom: "10px" }}>Products</h6>
            <ul style={{ listStyle: "none", padding: 0, fontSize: "14px", opacity: 0.8 }}>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Equity</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Derivatives</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Mutual Funds</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Bonds</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className='col'>
            <h6 style={{ fontWeight: "bold", marginBottom: "10px" }}>Support</h6>
            <ul style={{ listStyle: "none", padding: 0, fontSize: "14px", opacity: 0.8 }}>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Help Center</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Contact Us</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>FAQs</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Live Chat</a></li>
            </ul>
          </div>

          {/* Column 5 */}
          <div className='col'>
            <h6 style={{ fontWeight: "bold", marginBottom: "10px" }}>Quick Links</h6>
            <ul style={{ listStyle: "none", padding: 0, fontSize: "14px", opacity: 0.8 }}>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Upcoming IPOs</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Brokerage charges</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Market holidays</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Economic calendar</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Calculators</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Markets</a></li>
              <li style={listItemStyle}><a href="#" style={linkStyle}>Sectors</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Text */}
        <div style={{ marginTop: "40px" }}>
          <p style={textStyle}>
           Stockflow Broking Ltd.: Member of NSE, BSE​ &​ MCX – SEBI Registration no.: INZ000031633 CDSL/NSDL: Depository services through stockflow Broking Ltd. – SEBI Registration no.: IN-DP-431-2019 Commodity Trading through  stockflow Commodities Pvt. Ltd. MCX: 46025; SEBI Registration no.: INZ000038238 Registered Address:  stockflow Broking Ltd., #153/154, 4th Cross, Dollars Colony, Opp. Clarence Public School, J.P Nagar 4th Phase, Bengaluru - 560078, Karnataka, India. For any complaints pertaining to securities broking please write to complaints@Stockflow.com, for DP related to dp@ stockflow.com. Please ensure you carefully read the Risk Disclosure Document as prescribed by SEBI | ICF
          </p>
          <p style={textStyle}>
            Procedure to file a complaint on SEBI SCORES: Register on SCORES portal. Mandatory details for filing complaints on SCORES: Name, PAN, Address, Mobile Number, E-mail ID. Benefits: Effective Communication, Speedy redressal of the grievances
          </p>
          <a href="#" style={{ ...linkStyle, display: "block", marginBottom: "10px" }}>Smart Online Dispute Resolution | Grievances Redressal Mechanism</a>
          <p style={textStyle}>
            Prevent unauthorised transactions in your account. Update your mobile numbers/email IDs with your stock brokers. Receive information of your transactions directly from Exchange on your mobile/email at the end of the day. Issued in the interest of investors. KYC is one time exercise while dealing in securities markets - once KYC is done through a SEBI registered intermediary (broker, DP, Mutual Fund etc.), you need not undergo the same process again when you approach another intermediary." Dear Investor, if you are subscribing to an IPO, there is no need to issue a cheque. Please write the Bank account number and sign the IPO application form to authorize your bank to make payment in case of allotment. In case of non allotment the funds will remain in your bank account. As a business we don't give stock tips, and have not authorized anyone to trade on behalf of others. If you find anyone claiming to be part of stockflow and offering such services, please create a ticket here.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
