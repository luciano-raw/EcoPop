import React, { useEffect, useState, useRef } from 'react';
import { dbService, type EcoUser, type QrCode } from '../services/db';
import { triggerConfetti } from '../components/ConfettiCelebration';
import { QrCode as QrIcon, CheckCircle, XCircle, AlertTriangle, UserPlus, ArrowRight, Home, ShoppingBag, HelpCircle } from 'lucide-react';

interface QrScanSimulatorProps {
  code: string;
  currentUser: EcoUser | null;
  onLoginSuccess: (user: EcoUser) => void;
  onNavigate: (page: string) => void;
  onPointsUpdate?: () => void;
}

export const QrScanSimulator: React.FC<QrScanSimulatorProps> = ({ code, currentUser, onLoginSuccess, onNavigate, onPointsUpdate }) => {
  const lastProcessedCodeRef = useRef('');
  const [loading, setLoading] = useState(true);
  const [scanStatus, setScanStatus] = useState<'success' | 'already_claimed' | 'invalid' | 'need_auth' | 'loading'>('loading');
  const [qrInfo, setQrInfo] = useState<QrCode | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Register Form States (if need auth)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (lastProcessedCodeRef.current === code) return;
    lastProcessedCodeRef.current = code;

    // Reset loading and status
    setLoading(true);
    setScanStatus('loading');

    // Process the QR code scan
    if (!code) {
      setScanStatus('invalid');
      setErrorMsg('No se proporcionó ningún código QR para escanear.');
      setLoading(false);
      return;
    }

    let qr = dbService.getQrCode(code);
    
    // Auto-crear el código si no existe en la base de datos local de este dispositivo
    // Esto permite que al escanear con el celular un código creado en la computadora funcione de inmediato
    if (!qr) {
      qr = dbService.createQrCode(code, 100);
    }
    
    const finalQr = qr;

    // Simulate camera processing delay
    const timer = setTimeout(() => {
      if (!finalQr) {
        setQrInfo(null);
        setScanStatus('invalid');
        setErrorMsg(`El código QR "${code}" no existe en el sistema.`);
      } else {
        setQrInfo(finalQr);
        if (!finalQr.isActive) {
          setScanStatus('already_claimed');
        } else if (!currentUser) {
          setScanStatus('need_auth');
        } else {
          // Process claim immediately for logged-in user
          performClaim(currentUser.id, finalQr.code);
        }
      }
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [code, currentUser]);

  const performClaim = (userId: string, qrCode: string) => {
    const result = dbService.claimQrCode(userId, qrCode);
    if (result.success && result.pointsEarned) {
      setPointsEarned(result.pointsEarned);
      setScanStatus('success');
      
      // Notify parent to reload user points
      if (onPointsUpdate) {
        onPointsUpdate();
      }
      
      // Get updated user points to trigger confetti scale
      const updatedUser = dbService.getCurrentUser();
      if (updatedUser) {
        triggerConfetti(result.pointsEarned, updatedUser.points);
      }
    } else {
      setScanStatus('already_claimed');
      setErrorMsg(result.message);
    }
  };

  const handleRegisterAndClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim()) {
      setFormError('Por favor, completa todos los campos.');
      return;
    }

    if (!email.includes('@')) {
      setFormError('Ingresa un correo electrónico válido.');
      return;
    }

    // Register user
    const newUser = dbService.loginOrRegister(name.trim(), email.trim());
    onLoginSuccess(newUser);

    // Perform the QR claim for the newly registered user
    if (qrInfo) {
      performClaim(newUser.id, qrInfo.code);
    }
  };

  // Helper to create and scan on the fly (for better developer testing)
  const handleCreateAndScan = () => {
    setLoading(true);
    const newQr = dbService.createQrCode(code, 100);
    setQrInfo(newQr);
    
    if (!currentUser) {
      setScanStatus('need_auth');
    } else {
      performClaim(currentUser.id, newQr.code);
    }
    setLoading(false);
  };

  return (
    <div className="animate-slide-up" style={{
      maxWidth: '600px',
      width: '100%',
      margin: '60px auto',
      padding: '0 20px',
      textAlign: 'center'
    }}>
      {/* Loading Scanning State */}
      {loading && (
        <div className="glass-panel pulse-glow" style={{
          padding: '50px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          border: '1px solid var(--border-active)'
        }}>
          {/* Animated Scanning Circle */}
          <div className="scanner-frame">
            <QrIcon size={64} style={{ color: 'var(--color-primary)' }} />
            <div className="scanner-laser" />
          </div>

          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Procesando Vaso EcoPop</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
              Escaneando código: <code style={{ color: 'var(--color-accent)' }}>{code}</code>
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {!loading && scanStatus === 'success' && (
        <div className="glass-panel pulse-eco-glow" style={{
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          border: '2px solid var(--color-eco)'
        }}>
          <div className="animate-bounce-in">
            <CheckCircle size={72} style={{ color: 'var(--color-eco)' }} />
          </div>
          
          <div className="animate-bounce-in" style={{ animationDelay: '0.2s' } as any}>
            <span style={{
              fontSize: '0.85rem',
              color: 'var(--color-eco)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600
            }}>
              ¡Vasos Reciclados Correctamente!
            </span>
            <h2 style={{ fontSize: '3.2rem', fontWeight: 900, marginTop: '16px', textShadow: '0 0 25px rgba(16, 185, 129, 0.35)' }} className="text-gradient-eco">
              +{pointsEarned} Puntos
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '400px', margin: '8px auto 0' }}>
              Código de vaso <code style={{ color: '#fff' }}>{code}</code> registrado. ¡Muchas gracias por ayudar a cuidar el planeta!
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            border: '1px solid var(--border-light)',
            padding: '16px',
            width: '100%',
            textAlign: 'left'
          }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tu balance actual:</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {dbService.getCurrentUser()?.points} Puntos acumulados en tu cuenta
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('dashboard')} className="btn btn-secondary" style={{ flex: 1, gap: '6px', minWidth: '150px' }}>
              <Home size={16} /> Ir al Panel
            </button>
            <button onClick={() => onNavigate('catalog')} className="btn btn-eco" style={{ flex: 1, gap: '6px', minWidth: '150px' }}>
              <ShoppingBag size={16} /> Canjear Premios
            </button>
          </div>
        </div>
      )}

      {/* Need Auth State */}
      {!loading && scanStatus === 'need_auth' && (
        <div className="glass-panel" style={{
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255, 204, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrIcon size={24} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>¡Vaso Detectado!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Se sumarán <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{qrInfo?.pointsValue} puntos</span> a tu cuenta.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Para poder acreditar los puntos de reciclaje del vaso <code style={{ color: '#fff' }}>{code}</code>, ingresa tus datos rápidos para crear tu cuenta digital de <strong>Club EcoPop</strong>:
            </p>
          </div>

          <form onSubmit={handleRegisterAndClaim} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Nombre Completo</label>
              <input 
                type="text" 
                placeholder="Ej: Juan Pérez" 
                value={name}
                onChange={(e) => setName(e.target.value)}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="Ej: juan.perez@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            {formError && (
              <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: 500 }}>{formError}</p>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '8px', borderRadius: '8px', padding: '14px' }}>
              <UserPlus size={18} /> Registrarme y Sumar Puntos <ArrowRight size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Already Claimed State */}
      {!loading && scanStatus === 'already_claimed' && (
        <div className="glass-panel" style={{
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          border: '1px solid rgba(239, 68, 68, 0.4)'
        }}>
          <AlertTriangle size={64} style={{ color: '#fbbf24' }} />
          
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Código QR ya Utilizado</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px', maxWidth: '400px' }}>
              {errorMsg || `El vaso ecológico con el código QR "${code}" ya fue escaneado e ingresado al sistema de reciclaje.`}
            </p>
          </div>

          <div style={{
            background: 'rgba(251, 191, 36, 0.05)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            textAlign: 'left'
          }}>
            <strong>Nota EcoPop:</strong> Para evitar fraudes y garantizar que cada vaso sea reciclado físicamente en los contenedores de Cinépolis, cada código QR impreso es único y expira después de su primer escaneo.
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button onClick={() => onNavigate('dashboard')} className="btn btn-secondary" style={{ flex: 1, gap: '6px' }}>
              Ir al Panel Principal
            </button>
            <button onClick={() => onNavigate('admin')} className="btn btn-primary" style={{ flex: 1, gap: '6px' }}>
              Panel Administrador
            </button>
          </div>
        </div>
      )}

      {/* Invalid QR State */}
      {!loading && scanStatus === 'invalid' && (
        <div className="glass-panel" style={{
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          border: '1px solid rgba(239, 68, 68, 0.5)'
        }}>
          <XCircle size={64} style={{ color: 'var(--color-danger)' }} />
          
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Código QR no Válido</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
              {errorMsg || 'El código escaneado no coincide con el patrón del sistema.'}
            </p>
          </div>

          {/* Developer Quick-Helper Box */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed var(--border-light)',
            borderRadius: '12px',
            padding: '20px',
            width: '100%',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={16} /> Atajo para Desarrollador / Pruebas
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              ¿Quieres registrar este código QR temporalmente en tu base de datos local para poder testear su escaneo?
            </p>
            <button 
              onClick={handleCreateAndScan} 
              className="btn btn-eco" 
              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '6px', alignSelf: 'start' }}
            >
              Registrar "{code}" y Escanear
            </button>
          </div>

          <button onClick={() => onNavigate('dashboard')} className="btn btn-secondary" style={{ width: '100%' }}>
            Ir al Inicio
          </button>
        </div>
      )}
    </div>
  );
};
