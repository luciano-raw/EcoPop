import React, { useState } from 'react';
import { dbService, type EcoUser, INITIAL_REWARDS, type Reward } from '../services/db';
import { triggerConfetti } from '../components/ConfettiCelebration';
import { Sparkles, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface RewardsCatalogProps {
  currentUser: EcoUser | null;
  onPointsUpdate: () => void;
  onNavigate: (page: string) => void;
  onLoginClick: () => void;
}

export const RewardsCatalog: React.FC<RewardsCatalogProps> = ({ currentUser, onPointsUpdate, onNavigate, onLoginClick }) => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const categories = [
    { id: 'todos', name: 'Todos' },
    { id: 'alimentos', name: '🍿 Dulcería' },
    { id: 'descuentos', name: '🎟️ Descuentos' },
    { id: 'figuras', name: '🦖 Figuras y Coleccionables' }
  ];

  const filteredRewards = activeCategory === 'todos' 
    ? INITIAL_REWARDS 
    : INITIAL_REWARDS.filter(r => r.category === activeCategory);

  const handleClaim = (reward: Reward) => {
    if (!currentUser) return;
    
    setClaimingId(reward.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Simulate network delay
    setTimeout(() => {
      const result = dbService.claimReward(currentUser.id, reward.id);
      
      if (result.success) {
        setSuccessMsg(`¡Recompensa desbloqueada! Canjeaste "${reward.title}".`);
        onPointsUpdate();
        
        // Trigger a nice success confetti burst
        const updatedUser = dbService.getCurrentUser();
        if (updatedUser) {
          triggerConfetti(50, updatedUser.points); // small burst
        }
      } else {
        setErrorMsg(result.message);
      }
      setClaimingId(null);
    }, 1000);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>
            Catálogo de Recompensas
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Canjea tus eco-puntos por promociones y regalos en Cinépolis.
          </p>
        </div>
        {currentUser && (
          <div className="glass-panel" style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-eco)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-eco-light)'
          }}>
            <Sparkles size={16} style={{ color: 'var(--color-eco)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Tienes:</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--color-eco)' }}>{currentUser.points} pts</strong>
          </div>
        )}
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid var(--color-eco)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle style={{ color: 'var(--color-eco)' }} size={20} />
            <span style={{ fontSize: '0.9rem' }}>{successMsg}</span>
          </div>
          <button 
            onClick={() => onNavigate('coupons')}
            className="btn btn-eco" 
            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px', gap: '4px' }}
          >
            Ver Mis Cupones <ArrowRight size={14} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--color-danger)',
          color: 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textAlign: 'left'
        }}>
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.9rem' }}>{errorMsg}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '12px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              border: activeCategory === cat.id ? '1px solid var(--color-primary)' : '1px solid var(--border-light)',
              background: activeCategory === cat.id ? 'rgba(0, 59, 255, 0.1)' : 'transparent',
              color: activeCategory === cat.id ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: activeCategory === cat.id ? 600 : 500,
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {filteredRewards.map(reward => {
          const hasPoints = currentUser ? currentUser.points >= reward.pointsCost : false;
          
          return (
            <div 
              key={reward.id} 
              className="glass-panel" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                textAlign: 'left',
                border: claimingId === reward.id ? '1px solid var(--color-primary)' : '1px solid var(--border-light)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Category Badge */}
              <span style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                color: reward.category === 'alimentos' ? '#fbbf24' : reward.category === 'descuentos' ? '#38bdf8' : 'var(--color-eco)',
                backgroundColor: 'rgba(255,255,255,0.03)',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.05)',
                fontWeight: 600
              }}>
                {reward.category}
              </span>

              {/* Icon Bubble */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                {reward.image}
              </div>

              {/* Title & Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>{reward.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, height: '60px', overflow: 'hidden' }}>
                  {reward.description}
                </p>
              </div>

              {/* Cost Bubble */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border-light)',
                paddingTop: '12px',
                marginTop: 'auto'
              }}>
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Costo</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                    {reward.pointsCost} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>pts</span>
                  </p>
                </div>
                
                {/* Action button */}
                {!currentUser ? (
                  <button 
                    onClick={onLoginClick} 
                    className="btn btn-secondary" 
                    style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: '6px' }}
                  >
                    Identificarse
                  </button>
                ) : (
                  <button
                    disabled={!hasPoints || claimingId !== null}
                    onClick={() => handleClaim(reward)}
                    className={hasPoints ? "btn btn-primary" : "btn btn-disabled"}
                    style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '6px' }}
                  >
                    {claimingId === reward.id ? 'Canjeando...' : hasPoints ? 'Canjear' : 'Puntos Insuficientes'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
