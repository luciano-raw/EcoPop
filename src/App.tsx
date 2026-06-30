import { useState, useEffect } from 'react';
import { dbService, type EcoUser } from './services/db';
import { Dashboard } from './views/Dashboard';
import { QrScanSimulator } from './views/QrScanSimulator';
import { RewardsCatalog } from './views/RewardsCatalog';
import { MyCoupons } from './views/MyCoupons';
import { AdminPanel } from './views/AdminPanel';
import { User, X, Home, ShoppingBag, Ticket, QrCode } from 'lucide-react';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [scanCode, setScanCode] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<EcoUser | null>(null);
  
  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');

  // Read URL parameters on startup to detect QR code scan
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || params.get('scan');
    const page = params.get('page');
    
    // Sync session user
    const savedUser = dbService.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }

    if (code) {
      setScanCode(code);
      setCurrentPage('scan');
      // Clean URL parameters to prevent repeated scans on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (page) {
      setCurrentPage(page);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePointsUpdate = () => {
    const updated = dbService.getCurrentUser();
    setCurrentUser(updated);
  };

  const handleLoginSuccess = (user: EcoUser) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    setLoginName('');
    setLoginEmail('');
    setLoginError('');
  };

  const handleLogout = () => {
    dbService.logout();
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  const triggerLoginModal = () => {
    setShowLoginModal(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginName.trim() || !loginEmail.trim()) {
      setLoginError('Todos los campos son obligatorios.');
      return;
    }

    if (!loginEmail.includes('@')) {
      setLoginError('Ingresa un correo electrónico válido.');
      return;
    }

    const user = dbService.loginOrRegister(loginName.trim(), loginEmail.trim());
    handleLoginSuccess(user);
  };

  const handleSimulateScan = (code: string) => {
    setScanCode(code);
    setCurrentPage('scan');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      justifyContent: 'space-between'
    }}>
      {/* Navigation Header */}
      <header style={{
        background: 'rgba(10, 16, 36, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Logo Brand */}
          <div 
            onClick={() => handleNavigate('dashboard')} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: '#fff',
              boxShadow: '0 0 15px rgba(0, 59, 255, 0.4)'
            }}>
              ★
            </div>
            <div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>
                EcoPop
              </span>
              <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--color-accent)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', marginTop: '-4px' }}>
                Cinépolis Recicla
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="desktop-only" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => handleNavigate('dashboard')}
              style={{
                background: currentPage === 'dashboard' ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none',
                color: currentPage === 'dashboard' ? '#fff' : 'var(--text-secondary)',
                fontWeight: currentPage === 'dashboard' ? 600 : 500,
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              Panel
            </button>
            <button 
              onClick={() => handleNavigate('catalog')}
              style={{
                background: currentPage === 'catalog' ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none',
                color: currentPage === 'catalog' ? '#fff' : 'var(--text-secondary)',
                fontWeight: currentPage === 'catalog' ? 600 : 500,
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              Premios
            </button>
            <button 
              onClick={() => handleNavigate('coupons')}
              style={{
                background: currentPage === 'coupons' ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none',
                color: currentPage === 'coupons' ? '#fff' : 'var(--text-secondary)',
                fontWeight: currentPage === 'coupons' ? 600 : 500,
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              Mis Cupones
            </button>
            <button 
              onClick={() => handleNavigate('admin')}
              style={{
                background: currentPage === 'admin' ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none',
                color: currentPage === 'admin' ? '#fff' : 'var(--text-secondary)',
                fontWeight: currentPage === 'admin' ? 600 : 500,
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              Admin Panel
            </button>
          </nav>

          {/* User Profile / Auth State */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {currentUser ? (
              <div 
                onClick={() => handleNavigate('dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-eco)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                  {currentUser.name.split(' ')[0]}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-accent)',
                  fontWeight: 700,
                  backgroundColor: 'rgba(255,204,0,0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {currentUser.points} pts
                </span>
              </div>
            ) : (
              <button onClick={triggerLoginModal} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <User size={14} /> Identificarse
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', width: '100%' }}>
        {currentPage === 'dashboard' && (
          <Dashboard 
            user={currentUser} 
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onLoginClick={triggerLoginModal}
          />
        )}
        {currentPage === 'catalog' && (
          <RewardsCatalog 
            currentUser={currentUser}
            onPointsUpdate={handlePointsUpdate}
            onNavigate={handleNavigate}
            onLoginClick={triggerLoginModal}
          />
        )}
        {currentPage === 'coupons' && (
          <MyCoupons 
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onLoginClick={triggerLoginModal}
          />
        )}
        {currentPage === 'admin' && (
          <AdminPanel onSimulateScan={handleSimulateScan} />
        )}
        {currentPage === 'scan' && (
          <QrScanSimulator 
            code={scanCode}
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-light)',
        padding: '30px 24px',
        textAlign: 'center',
        background: 'rgba(10, 16, 36, 0.3)',
        marginTop: '60px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            🍿 <strong>EcoPop Cinépolis</strong> - Proyecto de reciclaje de vasos inteligentes.
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Desarrollado para concientizar sobre el cuidado ambiental. Los cupones y puntos mostrados son de carácter ficticio para la demostración del prototipo.
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Hecho con 💚 para Cinépolis</span> • 
            <button 
              onClick={() => handleNavigate('admin')} 
              style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', textDecoration: 'underline', font: 'inherit', padding: 0 }}
            >
              Simulador Admin
            </button>
          </p>
        </div>
      </footer>

      {/* Mobile Floating Tab Bar */}
      <div className="mobile-tab-bar mobile-only">
        <button 
          onClick={() => handleNavigate('dashboard')} 
          className={`mobile-tab-btn ${currentPage === 'dashboard' ? 'mobile-tab-btn-active' : ''}`}
        >
          <Home size={20} />
          <span>Panel</span>
        </button>
        <button 
          onClick={() => handleNavigate('catalog')} 
          className={`mobile-tab-btn ${currentPage === 'catalog' ? 'mobile-tab-btn-active' : ''}`}
        >
          <ShoppingBag size={20} />
          <span>Premios</span>
        </button>
        <button 
          onClick={() => handleNavigate('coupons')} 
          className={`mobile-tab-btn ${currentPage === 'coupons' ? 'mobile-tab-btn-active' : ''}`}
        >
          <Ticket size={20} />
          <span>Cupones</span>
        </button>
        <button 
          onClick={() => handleNavigate('admin')} 
          className={`mobile-tab-btn ${currentPage === 'admin' ? 'mobile-tab-btn-active' : ''}`}
        >
          <QrCode size={20} />
          <span>Admin</span>
        </button>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(2, 6, 23, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '400px',
            width: '100%',
            backgroundColor: '#0a1024',
            border: '1px solid var(--border-active)',
            borderRadius: '20px',
            padding: '32px',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowLoginModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 59, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                border: '1px solid rgba(0, 59, 255, 0.3)'
              }}>
                <User size={24} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Club EcoPop</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Identifícate para acumular puntos y canjear cupones.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tu Nombre</label>
                <input 
                  type="text" 
                  placeholder="Juan Pérez" 
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-light)',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tu Email</label>
                <input 
                  type="email" 
                  placeholder="juan.perez@email.com" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-light)',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {loginError && (
                <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: 500, textAlign: 'left' }}>
                  {loginError}
                </p>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '8px', padding: '12px' }}>
                Entrar / Registrarse
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
