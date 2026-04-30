import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import HomePage from './landingpage/home/HomePage';
import Signup from './landingpage/signup/Signup';
import Login from './landingpage/signup/Login';
import AboutPage from './landingpage/about/AboutPage';
import ProductsPage from './landingpage/products/ProductsPage';
import PricingPage from './landingpage/pricing/PricingPage';
import SupportPage from './landingpage/support/SupportPage';
import NotFound from './landingpage/NotFound';
import ForgotPassword from './landingpage/signup/ForgotPassword';
import ResetPassword from './landingpage/signup/ResetPassword';
import VerifyEmail from './landingpage/signup/VerifyEmail';
import Navbar from './landingpage/Navbar';

import Footer from './landingpage/Footer';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="598164736092-urhrchs4c87n8o0fntb5j2ih0629ea6d.apps.googleusercontent.com">
    <BrowserRouter>
      <div className="main-container">
        <Navbar />
        <div className="content-wrapper">
          <Routes>
            <Route path='/' element={<HomePage />}></Route>
            <Route path='/signup' element={<Signup />}></Route>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/forgot-password' element={<ForgotPassword />}></Route>
            <Route path='/reset-password/:token' element={<ResetPassword />}></Route>
            <Route path='/verify-email/:token' element={<VerifyEmail />}></Route>

            <Route path='/about' element={<AboutPage />}></Route>
            <Route path='/product' element={<ProductsPage />}></Route>
            <Route path='/pricing' element={<PricingPage />}></Route>
            <Route path='/support' element={<SupportPage />}></Route>
            <Route path='*' element={<NotFound />}></Route>
          </Routes>
        </div>
        <div className="footer-wrapper">
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  </GoogleOAuthProvider>
);




