import React, { useMemo } from 'react';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { BANNED_CARDS, RESTRICTED_CARDS } from '../data/banlist';
import './BanlistViewModal.css';
import { DbfwCard } from './DbfwCard';

interface BanlistViewModalProps {
  dbfwData: any[];
  onClose: () => void;
}

export const BanlistViewModal: React.FC<BanlistViewModalProps> = ({ dbfwData, onClose }) => {
  const bannedCards = useMemo(() => {
    return BANNED_CARDS.map(id => dbfwData.find(c => c.id === id)).filter(Boolean);
  }, [dbfwData]);

  const restrictedCards = useMemo(() => {
    return RESTRICTED_CARDS.map(id => dbfwData.find(c => c.id === id)).filter(Boolean);
  }, [dbfwData]);

  return (
    <div className="banlist-modal-overlay" onClick={onClose}>
      <div className="banlist-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="banlist-header">
          <h2>Lista de Cartas Banidas e Restritas</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="banlist-body">
          <section className="banlist-section">
            <h3 className="section-title banned">
              <ShieldAlert size={20} /> Banidas (0 Cópias)
            </h3>
            <p className="section-desc">Estas cartas não podem ser utilizadas em nenhuma quantidade no deck.</p>
            {bannedCards.length === 0 ? (
              <p className="empty-msg">Nenhuma carta banida.</p>
            ) : (
              <div className="banlist-grid">
                {bannedCards.map(card => (
                  <div key={card.id} className="banlist-card-wrapper">
                    <DbfwCard card={card} onClick={() => {}} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="banlist-section">
            <h3 className="section-title restricted">
              <AlertTriangle size={20} /> Restritas (1 Cópia)
            </h3>
            <p className="section-desc">Você só pode utilizar até 1 cópia destas cartas no seu deck.</p>
            {restrictedCards.length === 0 ? (
              <p className="empty-msg">Nenhuma carta restrita.</p>
            ) : (
              <div className="banlist-grid">
                {restrictedCards.map(card => (
                  <div key={card.id} className="banlist-card-wrapper">
                    <DbfwCard card={card} onClick={() => {}} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
