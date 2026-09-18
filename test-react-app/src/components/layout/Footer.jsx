import React from 'react';

const CONTACT_EMAIL = 'arayasuryanto@digital360.id';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-col">
            <div className="footer-logo">
              <img
                src="/images/cafinder-logo.png"
                alt="Cafinder Logo"
                style={{ height: '40px', width: 'auto' }}
              />
            </div>
            <p className="footer-desc">Temukan wawasan dan rekomendasi untuk meningkatkan pengalaman cafe Anda di Surabaya dan sekitarnya.</p>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Menu</h3>
            <ul className="footer-links">
              <li><a href="/map">Peta Cafe</a></li>
              <li><a href="/catalog">Katalog Cafe</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Fitur</h3>
            <ul className="footer-links">
              <li><a href="/finder">Smart Finder</a></li>
              <li><a href="/tentang-kami">Tentang Kami</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Hubungi Kami</h3>
            <p className="footer-desc">
              Punya masukan atau mau cafe kamu tampil di Cafinder?
            </p>
            <a className="footer-contact-link" href={`mailto:${CONTACT_EMAIL}?subject=Cafinder%20-%20Halo`}>
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Dibuat dengan ❤️ oleh Cafinder</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
