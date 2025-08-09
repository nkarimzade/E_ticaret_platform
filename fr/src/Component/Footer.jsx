import React from "react";
import "./Footer.css";

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  const handleSubscribe = (event) => {
    event.preventDefault();
    // Burada e-posta aboneliği entegrasyonu yapılabilir
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <h2 className="footer-logo">HeShop</h2>
            <p className="footer-desc">Senin e-ticaret mağazan</p>

            <div className="footer-badges">
              <a className="store-badge" href="#" aria-label="Google Play">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="badge-icon" viewBox="0 0 512 512">
                  <path d="M99.617 8.057a50.191 50.191 0 00-38.815-6.713l230.932 230.933 74.846-74.846L99.617 8.057zM32.139 20.116c-6.441 8.563-10.148 19.077-10.148 30.199v411.358c0 11.123 3.708 21.636 10.148 30.199l235.877-235.877L32.139 20.116zM464.261 212.087l-67.266-37.637-81.544 81.544 81.548 81.548 67.273-37.64c16.117-9.03 25.738-25.442 25.738-43.908s-9.621-34.877-25.749-43.907zM291.733 279.711L60.815 510.629c3.786.891 7.639 1.371 11.492 1.371a50.275 50.275 0 0027.31-8.07l266.965-149.372-74.849-74.847z"></path>
                </svg>
                <span className="badge-texts">
                  <span className="badge-small">GET IT ON</span>
                  <span className="badge-big">Google Play</span>
                </span>
              </a>

              <a className="store-badge" href="#" aria-label="App Store">
                <span className="badge-icon">
                  <svg fill="currentColor" viewBox="-52.01 0 560.035 560.035" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                      <path d="M380.844 297.529c.787 84.752 74.349 112.955 75.164 113.314-.622 1.988-11.754 40.191-38.756 79.652-23.343 34.117-47.568 68.107-85.731 68.811-37.499.691-49.557-22.236-92.429-22.236-42.859 0-56.256 21.533-91.753 22.928-36.837 1.395-64.889-36.891-88.424-70.883-48.093-69.53-84.846-196.475-35.496-282.165 24.516-42.554 68.328-69.501 115.882-70.192 36.173-.69 70.315 24.336 92.429 24.336 22.1 0 63.59-30.096 107.208-25.676 18.26.76 69.517 7.376 102.429 55.552-2.652 1.644-61.159 35.704-60.523 106.559M310.369 89.418C329.926 65.745 343.089 32.79 339.498 0 311.308 1.133 277.22 18.785 257 42.445c-18.121 20.952-33.991 54.487-29.709 86.628 31.421 2.431 63.52-15.967 83.078-39.655"></path>
                    </g>
                  </svg>
                </span>
                <span className="badge-texts">
                  <span className="badge-small">Download from</span>
                  <span className="badge-big">App Store</span>
                </span>
              </a>
            </div>

            <div className="footer-social">
              <a href="#" aria-label="Instagram" className="social-link"><FaInstagram /></a>
              <a href="#" aria-label="Twitter" className="social-link"><FaTwitter /></a>
              <a href="#" aria-label="Facebook" className="social-link"><FaFacebookF /></a>
              <a href="#" aria-label="LinkedIn" className="social-link"><FaLinkedinIn /></a>
            </div>
          </div>

          <div className="footer-col">
            <h3 className="col-title">Şirket</h3>
            <ul className="col-links">
              <li><a href="#">Hakkımızda</a></li>
              <li><a href="#">Kariyer</a></li>
              <li><a href="#">Basın</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="col-title">Destek</h3>
            <ul className="col-links">
              <li><a href="#">Yardım Merkezi</a></li>
              <li><a href="#">İade Politikası</a></li>
              <li><a href="#">Kargo Takibi</a></li>
              <li><a href="#">İletişim</a></li>
            </ul>
          </div>

          <div className="footer-col footer-newsletter">
            <h3 className="col-title">Bültene Abone Ol</h3>
            <p className="newsletter-desc">Kampanya ve yeniliklerden ilk sen haberdar ol.</p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input type="email" placeholder="E-posta adresiniz" aria-label="E-posta adresiniz" required />
              <button type="submit">Abone Ol</button>
            </form>
            <ul className="contact-list">
              <li><FaEnvelope /> support@heshop.com</li>
              <li><FaPhone /> +90 555 555 55 55</li>
              <li><FaMapMarkerAlt /> İstanbul, Türkiye</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 KRISOFT · Tüm hakları saklıdır.</p>
          <ul className="footer-legal">
            <li><a href="#">Gizlilik</a></li>
            <li><a href="#">Şartlar</a></li>
            <li><a href="#">Çerezler</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
