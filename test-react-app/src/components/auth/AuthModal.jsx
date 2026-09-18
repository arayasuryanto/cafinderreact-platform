import React from 'react';
import './AuthModal.css';

const CONTACT_EMAIL = 'arayasuryanto@digital360.id';

const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="auth-modal-content">
          <div className="auth-modal-logo">
            <img
              src="/images/cafinder-logo.png"
              alt="Cafinder Logo"
              className="modal-logo-img"
            />
          </div>

          <h2 className="auth-modal-title">
            Terima kasih sudah tertarik dengan Cafinder!
          </h2>

          <p className="auth-modal-description">
            Cafinder masih dalam tahap pengembangan, jadi fitur login belum
            kami buka. Tenang — pencarian cafe, peta, katalog, dan Smart
            Finder tetap bisa dipakai sepenuhnya tanpa akun.
          </p>

          <p className="auth-modal-description">
            Ingin berkolaborasi, punya masukan, atau mau cafe kamu tampil di
            Cafinder? Hubungi kami langsung:
          </p>

          <a
            className="auth-modal-cta"
            href={`mailto:${CONTACT_EMAIL}?subject=Cafinder%20-%20Halo`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
            </svg>
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
