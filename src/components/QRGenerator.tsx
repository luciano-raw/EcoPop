import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { dbService, type QrCode } from '../services/db';
import { QrCode as QrIcon, Plus, ExternalLink, RefreshCw } from 'lucide-react';

interface QRGeneratorProps {
  onCodeGenerated?: () => void;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ onCodeGenerated }) => {
  const [codeValue, setCodeValue] = useState('');
  const [points, setPoints] = useState(100);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [generatedCode, setGeneratedCode] = useState<QrCode | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codeValue.trim()) {
      setStatusMsg({ type: 'error', text: 'El código no puede estar vacío.' });
      return;
    }

    const formattedCode = codeValue.trim().toUpperCase();
    
    try {
      const newQr = dbService.createQrCode(formattedCode, points);
      setGeneratedCode(newQr);
      setStatusMsg({ type: 'success', text: `Código ${formattedCode} creado con éxito.` });
      setCodeValue('');
      if (onCodeGenerated) onCodeGenerated();
      
      // Auto-hide success message
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Ocurrió un error al crear el código.' });
    }
  };

  const generateRandomCode = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setCodeValue(`ECO-CUP-${num}`);
  };

  // Construct scan URL
  const getScanUrl = (code: string) => {
    return `${window.location.origin}${window.location.pathname}?code=${code}`;
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <QrIcon style={{ color: 'var(--color-primary)' }} size={24} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Generar QR para Vasos</h3>
      </div>

      <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ID del Código QR</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Ej: ECO-CUP-101" 
              value={codeValue}
              onChange={(e) => setCodeValue(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem'
              }}
            />
            <button 
              type="button"
              onClick={generateRandomCode}
              className="btn btn-secondary"
              style={{ padding: '0 16px', borderRadius: '8px' }}
              title="Generar ID Aleatorio"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Puntos a Otorgar</label>
          <select 
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem'
            }}
          >
            <option value={50}>50 Puntos</option>
            <option value={100}>100 Puntos (Recomendado - 2 escaneos = Figura)</option>
            <option value={150}>150 Puntos</option>
            <option value={200}>200 Puntos</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '8px' }}>
          <Plus size={18} /> Crear y Activar Código
        </button>
      </form>

      {statusMsg && (
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${statusMsg.type === 'success' ? 'var(--color-eco)' : 'var(--color-danger)'}`,
          color: statusMsg.type === 'success' ? 'var(--color-eco)' : 'var(--color-danger)',
          fontSize: '0.85rem',
          textAlign: 'left'
        }}>
          {statusMsg.text}
        </div>
      )}

      {generatedCode && (
        <div style={{
          marginTop: '10px',
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>QR Activo: {generatedCode.code}</p>
          <div style={{ padding: '12px', background: '#fff', borderRadius: '8px', display: 'inline-block' }}>
            <QRCodeSVG value={getScanUrl(generatedCode.code)} size={140} level="H" />
          </div>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <a 
              href={getScanUrl(generatedCode.code)}
              className="btn btn-eco" 
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              Simular Escaneo <ExternalLink size={14} />
            </a>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            El QR redirige al usuario a la página de EcoPop y le acredita {generatedCode.pointsValue} puntos al estar logueado.
          </p>
        </div>
      )}
    </div>
  );
};
