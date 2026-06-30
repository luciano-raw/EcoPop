import React, { useState } from 'react';
import { type EcoUser } from '../services/db';
import { ShareAchievement } from '../components/ShareAchievement';
import { Award, Leaf, Droplet, QrCode, LogOut, Share2, Tag } from 'lucide-react';

interface DashboardProps {
  user: EcoUser | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onLoginClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onLogout, onLoginClick }) => {
  const [showShareModal, setShowShareModal] = useState(false);

  // If user is guest/null, show landing page with login prompt
  if (!user) {
    return (
      <div style={{
        maxWidth: '800px',
        width: '100%',
        margin: '60px auto',
        padding: '0 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span style={{
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            color: 'var(--color-accent)',
            fontWeight: 700,
            background: 'rgba(255, 204, 0, 0.1)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            alignSelf: 'center'
          }}>
            Cinépolis presenta
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1 }}>
            Bienvenido a <span className="text-gradient-eco">EcoPop</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Recicla tus vasos en el cine, escanea su código QR único, acumula eco-puntos y canjéalos por cupones, combos de comida o figuras exclusivas.
          </p>
        </div>

        {/* Hero Card */}
        <div className="glass-panel pulse-glow" style={{
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(10, 16, 36, 0.9) 0%, rgba(6, 11, 24, 0.9) 100%)',
          border: '1px solid var(--border-active)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '10px 18px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>
              <QrCode size={18} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Escanea el Vaso</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '10px 18px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>
              <Award size={18} style={{ color: 'var(--color-accent)' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Gana Eco-Puntos</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '10px 18px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>
              <Tag size={18} style={{ color: 'var(--color-eco)' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Canjea Premios</span>
            </div>
          </div>

          <button onClick={onLoginClick} className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: 'var(--radius-full)' }}>
            Iniciar Sesión / Registrarse
          </button>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ¿Solo quieres probar el flujo? Puedes entrar como administrador para generar códigos QR y simular escaneos.
          </p>
          <button onClick={() => onNavigate('admin')} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
            Ir al Panel de Administración
          </button>
        </div>
      </div>
    );
  }

  // Calculate progress towards next tier (e.g. 200 points for a reward)
  const nextRewardCost = 200;
  const progressPercent = Math.min((user.points / nextRewardCost) * 100, 100);

  return (
    <div className="animate-slide-up" style={{
      maxWidth: '1000px',
      width: '100%',
      margin: '40px auto',
      padding: '0 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '30px'
    }}>
      {/* Welcome Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>
            Hola, <span className="text-gradient-cine">{user.name}</span> 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Nivel: {user.points >= 500 ? '🎖️ EcoHéroe Elite' : user.points >= 200 ? '🥈 EcoSocio Pro' : '🥉 EcoSocio Inicial'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowShareModal(true)} className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.9rem', borderRadius: '8px' }}>
            <Share2 size={16} /> Compartir Logro
          </button>
          <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </div>

      {/* Main Grid: Club Card & Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 360px) 1fr',
        gap: '24px',
        alignItems: 'stretch',
        flexWrap: 'wrap',
        '@media (maxWidth: 768px)': {
          gridTemplateColumns: '1fr'
        }
      } as any}>
        {/* Cinépolis Club EcoPop Card */}
        <div className="glass-panel hologram-card" style={{
          border: '1px solid var(--border-active)',
          borderRadius: '20px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'between',
          minHeight: '220px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 15px 35px rgba(0, 59, 255, 0.25)'
        }}>
          {/* Logo overlay background */}
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '10rem', opacity: 0.05, color: '#fff', userSelect: 'none', pointerEvents: 'none' }}>★</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', width: '100%' }}>
            <div>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-accent)', fontWeight: 700, margin: 0 }}>
                tarjeta digital
              </p>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '2px 0 0' }}>EcoPop Cinépolis</h3>
            </div>
            <div style={{ fontSize: '1.3rem', color: 'var(--color-accent)' }}>★</div>
          </div>

          <div style={{ margin: '30px 0 20px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Saldo Acumulado</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{user.points}</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-accent)', fontWeight: 600 }}>Puntos</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
            <div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Socio Club ID</p>
              <p style={{ fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 600, color: '#fff', letterSpacing: '1px' }}>{user.clubId}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Vence</p>
              <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#fff' }}>12/27</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Info Text */}
          <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Impacto Ecológico EcoPop</h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px'
            }}>
              {/* Recycled Count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <QrCode size={20} style={{ color: 'var(--color-eco)' }} />
                </div>
                <div>
                  <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--color-eco)' }}>{user.recycledCount}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vasos Reciclados</p>
                </div>
              </div>

              {/* CO2 Saved */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <Leaf size={20} style={{ color: '#38bdf8' }} />
                </div>
                <div>
                  <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#38bdf8' }}>{user.co2Saved} kg</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CO₂ Evitado</p>
                </div>
              </div>

              {/* Water Saved */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                  <Droplet size={20} style={{ color: '#fbbf24' }} />
                </div>
                <div>
                  <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#fbbf24' }}>{user.waterSaved} L</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Agua Ahorrada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar towards Next Reward */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Camino a tu próxima recompensa</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {user.points >= nextRewardCost 
                ? '¡Tienes puntos suficientes para canjear un cupón o figura!' 
                : `Te faltan ${nextRewardCost - user.points} puntos para tu próximo canje (1 vaso = 100 pts)`}
            </p>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-accent)' }}>
            {user.points} / {nextRewardCost} pts
          </span>
        </div>
        <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-eco))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>0 pts</span>
          <span>100 pts (Vaso Canjeable)</span>
          <span>200 pts (Figura / 40% Desc)</span>
          <span>300+ pts (Combos Grandes)</span>
        </div>
      </div>

      {/* Quick Action Box */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        flexWrap: 'wrap',
        '@media (maxWidth: 600px)': {
          gridTemplateColumns: '1fr'
        }
      } as any}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', borderLeft: '4px solid var(--color-eco)' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>¿Tienes un vaso para reciclar?</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Ubica el código QR impreso en el vaso de cartón reciclable de Cinépolis y escanéalo con la cámara de tu celular, o ingresa al panel de administración para simular códigos de vasos.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
            <button onClick={() => onNavigate('admin')} className="btn btn-eco" style={{ gap: '6px', fontSize: '0.85rem' }}>
              <QrCode size={16} /> Generador / Simulador
            </button>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', borderLeft: '4px solid var(--color-primary)' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Canjea tus Eco-Puntos</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Ingresa al catálogo interactivo y utiliza tus puntos acumulados para desbloquear cupones electrónicos de descuento en taquilla, combos de dulcería gratis o juguetes coleccionables.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
            <button onClick={() => onNavigate('catalog')} className="btn btn-primary" style={{ gap: '6px', fontSize: '0.85rem' }}>
              <Tag size={16} /> Ver Catálogo de Premios
            </button>
          </div>
        </div>
      </div>

      {/* Share Achievement Modal */}
      {showShareModal && (
        <ShareAchievement user={user} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
};
