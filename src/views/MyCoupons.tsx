import React, { useState, useEffect } from 'react';
import { dbService, type EcoUser } from '../services/db';
import { Calendar, Ticket, ShoppingBag, Eye } from 'lucide-react';

interface MyCouponsProps {
  currentUser: EcoUser | null;
  onNavigate: (page: string) => void;
  onLoginClick: () => void;
}

export const MyCoupons: React.FC<MyCouponsProps> = ({ currentUser, onNavigate, onLoginClick }) => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadCoupons();
    }
  }, [currentUser]);

  const loadCoupons = () => {
    if (currentUser) {
      const userCoupons = dbService.getUserCoupons(currentUser.id);
      setCoupons(userCoupons);
    }
  };

  const handleUseCoupon = (couponId: string) => {
    const success = dbService.useCoupon(couponId);
    if (success) {
      setActionSuccess(true);
      loadCoupons();
      // Update selected coupon state to show it is used
      setSelectedCoupon((prev: any) => prev && prev.id === couponId ? { ...prev, status: 'used' } : prev);
      
      setTimeout(() => setActionSuccess(false), 3000);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ maxWidth: '600px', width: '100%', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <Ticket size={64} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Inicia Sesión para ver tus Cupones</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Debes estar identificado en Club EcoPop para ver tus cupones digitales canjeados.
          </p>
          <button onClick={onLoginClick} className="btn btn-primary" style={{ padding: '12px 24px' }}>
            Identificarse
          </button>
        </div>
      </div>
    );
  }

  // CSS for drawing a simulated barcode
  const Barcode = () => {
    return (
      <div style={{
        display: 'flex',
        height: '60px',
        backgroundColor: '#fff',
        padding: '10px 14px',
        borderRadius: '4px',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: '2px',
        width: '100%',
        maxWidth: '220px',
        margin: '0 auto'
      }}>
        {Array.from({ length: 34 }).map((_, idx) => {
          const widths = [1, 2, 3, 4];
          const width = widths[(idx * 7 + 3) % widths.length];
          const color = (idx * 13 + 5) % 3 === 0 ? 'transparent' : '#000';
          return (
            <div key={idx} style={{
              width: `${width}px`,
              backgroundColor: color,
              height: '100%'
            }} />
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      maxWidth: '1000px',
      width: '100%',
      margin: '40px auto',
      padding: '0 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '30px'
    }}>
      {/* Header Row */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>
          Mis Cupones Reclamados
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Presenta estos cupones digitales en la boletería o dulcería de Cinépolis para hacerlos válidos.
        </p>
      </div>

      {/* Empty State */}
      {coupons.length === 0 && (
        <div className="glass-panel" style={{
          padding: '60px 40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <Ticket size={64} style={{ color: 'var(--text-muted)' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No tienes cupones todavía</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', maxWidth: '400px' }}>
              Los cupones que canjees con tus eco-puntos aparecerán aquí en tiempo real con sus respectivos códigos de barra.
            </p>
          </div>
          <button onClick={() => onNavigate('catalog')} className="btn btn-eco" style={{ padding: '12px 24px', gap: '8px' }}>
            <ShoppingBag size={18} /> Ir al Catálogo a Canjear
          </button>
        </div>
      )}

      {/* Coupons List Grid */}
      {coupons.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {coupons.map(coupon => {
            const isUsed = coupon.status === 'used';
            const formattedDate = new Date(coupon.claimedAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div 
                key={coupon.id} 
                className="glass-panel" 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  border: isUsed ? '1px solid var(--border-light)' : '1px solid var(--border-eco)',
                  opacity: isUsed ? 0.6 : 1,
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Coupon Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isUsed ? 'var(--text-muted)' : 'var(--color-eco)' }}>
                    <Ticket size={18} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      {coupon.reward.category}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    color: isUsed ? 'var(--text-muted)' : '#fff',
                    backgroundColor: isUsed ? 'rgba(255,255,255,0.02)' : 'rgba(16, 185, 129, 0.12)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${isUsed ? 'transparent' : 'var(--color-eco)'}`,
                    fontWeight: 600
                  }}>
                    {isUsed ? 'Canjeado/Usado' : 'Disponible'}
                  </span>
                </div>

                {/* Content */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'start' }}>
                  <div style={{ fontSize: '2.2rem', backgroundColor: 'rgba(255,255,255,0.02)', width: '50px', height: '50px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                    {coupon.reward.image}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{coupon.reward.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.3 }}>
                      {coupon.reward.description}
                    </p>
                  </div>
                </div>

                {/* Code Detail */}
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Código de Cupón</p>
                  <p style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '2px', color: isUsed ? 'var(--text-muted)' : 'var(--color-accent)', fontFamily: 'monospace' }}>
                    {coupon.couponCode}
                  </p>
                </div>

                {/* Footer Info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '12px',
                  marginTop: 'auto'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    <span>Obtenido: {formattedDate}</span>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedCoupon(coupon)} 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', gap: '4px' }}
                  >
                    <Eye size={12} /> Ver Código
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Barcode Overlay Modal */}
      {selectedCoupon && (
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
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div>
              <span style={{ fontSize: '2.5rem' }}>{selectedCoupon.reward.image}</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginTop: '10px' }}>
                {selectedCoupon.reward.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Presenta este código en taquilla o dulcería.
              </p>
            </div>

            {/* Simulated Barcode Container */}
            <div style={{
              background: '#fff',
              padding: '24px 16px 16px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Barcode />
              <p style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#000',
                letterSpacing: '3px',
                fontFamily: 'monospace',
                margin: 0
              }}>
                {selectedCoupon.couponCode}
              </p>
              <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                EcoPop Ticket Cinépolis
              </p>
            </div>

            {actionSuccess && (
              <p style={{ color: 'var(--color-eco)', fontSize: '0.85rem', fontWeight: 500 }}>
                ✓ ¡Cupón registrado como usado con éxito!
              </p>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedCoupon.status === 'active' ? (
                <button 
                  onClick={() => handleUseCoupon(selectedCoupon.id)}
                  className="btn btn-primary"
                  style={{ width: '100%', borderRadius: '8px', fontSize: '0.9rem' }}
                >
                  Simular Escaneo (Marcar como Usado)
                </button>
              ) : (
                <button 
                  disabled
                  className="btn btn-disabled"
                  style={{ width: '100%', borderRadius: '8px', fontSize: '0.9rem' }}
                >
                  Este cupón ya fue utilizado
                </button>
              )}

              <button 
                onClick={() => setSelectedCoupon(null)}
                className="btn btn-secondary"
                style={{ width: '100%', borderRadius: '8px', fontSize: '0.9rem' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
