import React, { useState, useEffect } from 'react';
import { dbService, type QrCode } from '../services/db';
import { QRGenerator } from '../components/QRGenerator';
import { Shield, List, RefreshCw, Trash2, ArrowRight } from 'lucide-react';

interface AdminPanelProps {
  onSimulateScan: (code: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onSimulateScan }) => {
  const [qrs, setQrs] = useState<QrCode[]>([]);

  const loadQrs = () => {
    const list = dbService.getAllQrCodes();
    setQrs(list);
  };

  useEffect(() => {
    loadQrs();
  }, []);

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar la base de datos de prueba? Se borrarán todos los usuarios, puntos y cupones creados en localStorage.')) {
      localStorage.removeItem('ecopop_users');
      localStorage.removeItem('ecopop_qr_codes');
      localStorage.removeItem('ecopop_claimed_codes');
      localStorage.removeItem('ecopop_user_coupons');
      sessionStorage.removeItem('ecopop_current_user');
      
      // Reload page to re-initialize defaults
      window.location.href = window.location.pathname;
    }
  };

  return (
    <div style={{
      maxWidth: '1000px',
      width: '100%',
      margin: '40px auto',
      padding: '0 20px',
      display: 'grid',
      gridTemplateColumns: '1fr 1.2fr',
      gap: '24px',
      alignItems: 'start',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr'
      }
    } as any}>
      {/* Col 1: Title and Generator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-primary)' }}>
            <Shield size={24} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Panel de Control</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Genera códigos QR de prueba y simula escaneos de vasos reciclables EcoPop.
          </p>
        </div>

        {/* QR Code Generator Component */}
        <QRGenerator onCodeGenerated={loadQrs} />

        {/* System Reset Card */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-danger)' }}>Operaciones del Sistema</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Restablece la aplicación a su estado de fábrica en `localStorage` (esto recreará los códigos de prueba `ECO-CUP-001` a `005`).
          </p>
          <button onClick={handleReset} className="btn btn-secondary" style={{
            gap: '6px',
            fontSize: '0.85rem',
            borderColor: 'rgba(239,68,68,0.3)',
            color: 'var(--color-danger)',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            borderRadius: '8px'
          }}>
            <Trash2 size={16} /> Reiniciar Base de Datos Local
          </button>
        </div>
      </div>

      {/* Col 2: Active Codes List */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <List size={20} style={{ color: 'var(--color-eco)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Listado de Códigos QR</h3>
          </div>
          <button onClick={loadQrs} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px', borderRadius: '6px' }}>
            <RefreshCw size={12} /> Actualizar
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: '480px',
          overflowY: 'auto',
          paddingRight: '6px'
        }}>
          {qrs.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>
              No hay códigos QR en el sistema. Utiliza el generador de la izquierda.
            </p>
          ) : (
            qrs.map(qr => (
              <div 
                key={qr.code} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-light)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>{qr.code}</strong>
                    <span style={{
                      fontSize: '0.65rem',
                      color: qr.isActive ? 'var(--color-eco)' : 'var(--text-muted)',
                      backgroundColor: qr.isActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: `1px solid ${qr.isActive ? 'var(--color-eco)' : 'transparent'}`,
                      fontWeight: 600
                    }}>
                      {qr.isActive ? 'Activo' : 'Reclamado'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Valor: {qr.pointsValue} Puntos
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {qr.isActive ? (
                    <button 
                      onClick={() => onSimulateScan(qr.code)}
                      className="btn btn-eco" 
                      style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px', borderRadius: '6px' }}
                    >
                      Escanear <ArrowRight size={12} />
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="btn btn-disabled"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                    >
                      Usado
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{
          marginTop: 'auto',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-light)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          textAlign: 'left',
          lineHeight: 1.4
        }}>
          💡 <strong>Guía de prueba rápida:</strong> 
          <ol style={{ paddingLeft: '18px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>Genera un código QR nuevo.</li>
            <li>Haz clic en <strong>"Escanear"</strong> para simular que un cliente lee el QR del vaso con su cámara.</li>
            <li>El sistema cargará la pantalla de simulación de escaneo.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
