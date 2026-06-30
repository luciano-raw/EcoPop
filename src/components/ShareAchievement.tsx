import React, { useState } from 'react';
import { type EcoUser } from '../services/db';
import { Copy, Check, MessageSquare, Award } from 'lucide-react';

interface ShareAchievementProps {
  user: EcoUser;
  onClose?: () => void;
}

export const ShareAchievement: React.FC<ShareAchievementProps> = ({ user, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareText = `¡Soy EcoHeroe en Cinépolis! 🍿✨ Acabo de reciclar ${user.recycledCount} vaso(s) en la iniciativa EcoPop, ahorrando ${user.co2Saved}kg de CO2 y ${user.waterSaved}L de agua. ¡Tengo ${user.points} puntos para canjear por premios! 🎬💚`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
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
      <div className="glass-panel pulse-glow" style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: '#0a1024',
        border: '1px solid var(--border-active)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '32px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 204, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--color-accent)'
          }}>
            <Award size={36} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>¡Comparte tu Logro Ecológico!</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Presume tu impacto ambiental con tus amigos y motívalos a reciclar en Cinépolis.
          </p>
        </div>

        {/* Certificate Card Preview */}
        <div style={{
          background: 'linear-gradient(135deg, #0d1e4a 0%, #060b18 100%)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Corner Stars */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '0.8rem', color: 'var(--color-accent)' }}>★</div>
          <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.8rem', color: 'var(--color-accent)' }}>★</div>
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '0.8rem', color: 'var(--color-accent)' }}>★</div>
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '0.8rem', color: 'var(--color-accent)' }}>★</div>

          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-accent)', fontWeight: 600 }}>
            EcoPop Cinépolis
          </p>
          <h4 style={{ fontSize: '1.2rem', margin: '8px 0 4px', color: '#fff', fontWeight: 700 }}>Certificado de EcoHéroe</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Otorgado con orgullo a</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: '4px 0 16px' }}>{user.name}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
            <div>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-eco)' }}>{user.recycledCount}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Vasos</p>
            </div>
            <div>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38bdf8' }}>{user.co2Saved}kg</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>CO2 Salvo</p>
            </div>
            <div>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-accent)' }}>{user.points}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Puntos</p>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleCopy} 
              className="btn btn-secondary" 
              style={{ flex: 1, gap: '6px', borderRadius: '8px', fontSize: '0.9rem' }}
            >
              {copied ? (
                <>
                  <Check size={16} style={{ color: 'var(--color-eco)' }} /> ¡Copiado!
                </>
              ) : (
                <>
                  <Copy size={16} /> Copiar Mensaje
                </>
              )}
            </button>
            <button 
              onClick={shareOnWhatsApp} 
              className="btn btn-eco" 
              style={{ flex: 1, gap: '6px', borderRadius: '8px', fontSize: '0.9rem' }}
            >
              <MessageSquare size={16} /> WhatsApp
            </button>
          </div>
          <button 
            onClick={shareOnTwitter} 
            className="btn btn-primary" 
            style={{ width: '100%', gap: '6px', borderRadius: '8px', fontSize: '0.9rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Compartir en X (Twitter)
          </button>
        </div>

        {/* Close button */}
        <button 
          onClick={onClose} 
          className="btn btn-secondary" 
          style={{ width: '100%', borderRadius: '8px', padding: '10px 0', border: 'none', background: 'rgba(255,255,255,0.02)' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
