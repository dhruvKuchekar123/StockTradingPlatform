import React from 'react';

function LeftSection({ imageURL, productName, productDescription, tryDemo, learnMore, googlePlay, appStore }) {
    return (
        <div className='container my-5'>
            <div className='row align-items-center py-5'>
                
                {/* Left - Image */}
                <div className='col-lg-6 col-md-12 text-center'>
                    <img 
                        src={imageURL} 
                        alt={productName} 
                        className="img-fluid"
                        style={{ maxHeight: "380px", objectFit: "contain" }} 
                    />
                </div>
                
                {/* Right - Text */}
                <div className='col-lg-6 col-md-12 mt-4 mt-lg-0'>
                    <h2 className='fw-bold mb-3' style={{ fontSize: "2rem" }}>{productName}</h2>
                    <p className='text-secondary fs-5 mb-4' style={{ lineHeight: "1.6" }}>
                        {productDescription}
                    </p>
                    
                    {/* Buttons */}
                    <div className='d-flex flex-wrap gap-4'>
                        <a href={tryDemo} className="text-decoration-none fw-semibold" style={{ color: "#387ed1" }}>
                            Try Demo <i className="fa fa-long-arrow-right ms-1"></i>
                        </a>
                        <a href={learnMore} className="text-decoration-none fw-semibold" style={{ color: "#387ed1" }}>
                            Learn More <i className="fa fa-long-arrow-right ms-1"></i>
                        </a>
                    </div>

                    {/* Store Badges */}
                    <div className='mt-4 d-flex flex-wrap gap-3'>
                        <a href={googlePlay}>
                            <img 
                                src="media/images/googlePlayBadge.svg" 
                                alt="Google Play" 
                                style={{ height: "40px" }} 
                            />
                        </a>
                        <a href={appStore}>
                            <img 
                                src="media/images/appstoreBadge.svg" 
                                alt="App Store" 
                                style={{ height: "40px" }} 
                            />
                        </a>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <hr className="mt-5" />
        </div>
    );
}

export default LeftSection;
