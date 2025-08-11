import React, { useState, useEffect } from 'react'
import './Navbar.css'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  // Hamburger menü dışına tıklandığında kapatma
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('mobile-menu')) {
      setIsOpen(false)
    }
  }

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'hidden' // Scroll'u engelle
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset' // Scroll'u geri aç
    }
  }, [isOpen])

  return (
    <>
     
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div style={{display: 'flex', alignItems: 'center', gap: '50px' }}  className="navbar-logo">
             <h1><a href="/">Heshop</a></h1>
             <ul className="navbar-menu">
            </ul>
          </div>

          {/* Desktop Buttons */}
          <div className="navbar-buttons">
            <a className="btn btn-outline" href="/panel">Daxil ol</a>
            <a className="btn btn-primary" href="/magaza-ac">Mağaza aç</a>
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`hamburger ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`mobile-menu ${isOpen ? 'open' : ''}`}
          onClick={handleOverlayClick}
        >
          <div className="mobile-menu-content">
            <div className="mobile-menu-header">
              <span className="mobile-logo">Heshop</span>
              <button className="mobile-close" onClick={() => setIsOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <ul className="mobile-nav-list">
              <li><a href="#" onClick={() => setIsOpen(false)}>Heshop nədir?</a></li>
            </ul>

            <div className="mobile-buttons">
              <a className="btn btn-outline" href="/panel" onClick={() => setIsOpen(false)}>Daxil ol</a>
              <a className="btn btn-primary" href="/magaza-ac" onClick={() => setIsOpen(false)}>Mağaza aç</a>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar