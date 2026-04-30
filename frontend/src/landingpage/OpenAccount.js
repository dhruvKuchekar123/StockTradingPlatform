import React from 'react'

function OpenAccount() {
    return ( 
       
      <div className="container text-center">

        <h1 className="mt-4 animate-slide-up mb-2">
          Open a <span className="highlight">Stockflow</span> account
        </h1>
        <p className="lead text-muted animate-fade-in ">
          Modern platforms and apps, ₹0 investments, and flat ₹20 intraday and F&O trades.
        </p>

        <button className="btn btn-primary hero-btn animate-scale mb-5" >
          Sign up for free
        </button>
      </div>
   
     );
}

export default OpenAccount;