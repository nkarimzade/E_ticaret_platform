import React from "react";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo"><a href="/"><img src="/bavılogo.png" alt="logo" style={{ width: '100px', height: '100px' }} /></a></div>
            <p className="footer-desc">Yerel mağazalardan ən yeni məhsullar.</p>
           
          </div>

          {/* Links */}
          <div className="footer-links">
            <div className="footer-section">
              <h3>Keşf et</h3>
              <ul>
                <li><a href="/">Mağazalar</a></li>
                <li><a href="/panel">Panel</a></li>
                <li><a href="/magaza-ac">Mağaza aç</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Kömək</h3>
              <ul>
                <li><a href="#">Tez-tez verilən suallar</a></li>
                <li><a href="#">Qaydalar</a></li>
                <li><a href="#">Gizlilik</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© {year} Bavio · Tüm hakları saklıdır.</p>
          {/* Founder satırını ELLEME — olduğu kimi korunur */}
          <p className="founder">Founder: <strong><a style={{color:'#6366f1'}} href="https://krisoft.shop">Krisoft</a></strong></p>
        </div>
      </div>
    </footer>
  );
}
