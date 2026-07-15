import React from 'react';
import { User, Settings2, Download, Trash2, Moon, Database } from 'lucide-react';
import './ProfileView.css';

interface ProfileViewProps {
  deckCount: number;
  onClearDeck: () => void;
  onExportDeck: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ deckCount, onClearDeck, onExportDeck }) => {
  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <div className="profile-avatar">
          <User size={40} />
        </div>
        <div className="profile-info">
          <h2>Jogador DBFW</h2>
          <p>Mestre de Fusões</p>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-title">
          <Database size={20} /> Base de Dados e Deck
        </h3>
        
        <div className="setting-row">
          <div className="setting-label">
            Cartas no Deck Atual
          </div>
          <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{deckCount}</span>
        </div>

        <div className="setting-row">
          <div className="setting-label">
            Exportar Deck
          </div>
          <button className="action-btn" onClick={onExportDeck}>
            <Download size={16} /> Copiar Código
          </button>
        </div>

        <div className="setting-row">
          <div className="setting-label">
            Limpar Deck
          </div>
          <button className="action-btn danger" onClick={onClearDeck}>
            <Trash2 size={16} /> Apagar Tudo
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-title">
          <Settings2 size={20} /> Preferências do App
        </h3>
        
        <div className="setting-row">
          <div className="setting-label">
            <Moon size={18} /> Tema Escuro (Glassmorphism)
          </div>
          <div style={{ color: '#00ff80', fontWeight: 'bold' }}>ATIVO</div>
        </div>

        <div className="setting-row">
          <div className="setting-label">
            Versão do Banco de Dados
          </div>
          <span style={{ color: 'var(--text-muted)' }}>v1.1 (1.892 Cartas)</span>
        </div>
      </div>

      <footer style={{
        marginTop: '32px',
        textAlign: 'center',
        padding: '16px',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        borderTop: '1px solid var(--border-light)'
      }}>
        Criado com <span style={{ color: 'var(--color-red)' }}>❤️</span> por Maikon Costa<br/>
        DBFW Pro © 2026
      </footer>
    </div>
  );
};
