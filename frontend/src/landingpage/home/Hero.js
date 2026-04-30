import React from 'react';
import { Link } from 'react-router-dom';
import '../Static/Hero.css';


function Hero() {
  return ( 
    <div className="hero-section text-center d-flex align-items-center justify-content-center">
      <div className="container">
        <img 
          src="media/images/homehero.png" 
          alt="hero" 
          className="mb-4 hero-img animate-fade-in"
        />

        <h1 className="mt-4 animate-slide-up">
          Invest in <span className="highlight">everything</span>
        </h1>
        <p className="lead text-muted animate-fade-in">
          Online platform to invest in stocks, derivatives, mutual funds, ETFs, bonds, and more.
        </p>

        <Link to="/signup">
          <button className="btn btn-primary hero-btn animate-scale">
            Sign up for free
          </button>
        </Link>
      </div>
    </div>
  );
}


export default Hero;
