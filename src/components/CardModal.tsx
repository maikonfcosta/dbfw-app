import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import './CardModal.css';

interface CardModalProps {
  card: any | null;
  onClose: () => void;
  quantityInDeck: number;
  onUpdateDeck: (card: any, quantity: number) => void;
}

export const CardModal: React.FC<CardModalProps> = ({ card, onClose, quantityInDeck, onUpdateDeck }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reseta o estado do flip quando a carta mudar
  useEffect(() => {
    setIsFlipped(false);
  }, [card]);

  if (!card) return null;

  const isLeader = card.type === 'LEADER';
  const maxCopies = isLeader ? 1 : 4;
  const backImage = card.image.replace('.webp', '_b.webp');
  
  const handleIncrease = () => {
    if (quantityInDeck < maxCopies) onUpdateDeck(card, quantityInDeck + 1);
  };

  const handleDecrease = () => {
    if (quantityInDeck > 0) onUpdateDeck(card, quantityInDeck - 1);
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="modal-content"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
          
          {/* LADO ESQUERDO: IMAGEM (Com efeito 3D) */}
          <div className="modal-left-pane">
            <div className={`modal-image-wrapper ${isFlipped ? 'is-flipped' : ''}`}>
              <div className="modal-image-inner">
                <div className="modal-image-front">
                  <img src={card.image} alt={card.name} />
                </div>
                {isLeader && (
                  <div className="modal-image-back">
                    <img src={backImage} alt={`${card.name} Awakened`} />
                  </div>
                )}
              </div>
            </div>

            {/* Controles de Flip (Apenas para Leaders) */}
            {isLeader && (
              <div className="modal-flip-controls">
                <button 
                  className={`flip-btn ${!isFlipped ? 'active' : ''}`}
                  onClick={() => setIsFlipped(false)}
                >
                  Front
                </button>
                <button 
                  className={`flip-btn ${isFlipped ? 'active' : ''}`}
                  onClick={() => setIsFlipped(true)}
                >
                  Awakened
                </button>
              </div>
            )}
          </div>

          {/* LADO DIREITO: DETALHES E DADOS */}
          <div className="modal-right-pane">
            <div className="modal-header">
              <h2 className="modal-title">{card.name}</h2>
              <div className="modal-subtitle">
                <span className={`color-dot ${card.color}`}></span>
                {card.id} • {card.rarity} • {card.type}
              </div>
            </div>

            {/* Controle de Quantidade no Deck */}
            <div className="deck-control">
              <div className="deck-control-header">
                <span>Cópias no Deck:</span>
                <span className="deck-count">{quantityInDeck} / {maxCopies}</span>
              </div>
              <div className="deck-actions-row">
                <button 
                  className="deck-btn decrease" 
                  onClick={handleDecrease}
                  disabled={quantityInDeck === 0}
                >
                  {quantityInDeck === 1 ? <Trash2 size={18} /> : <Minus size={18} />}
                </button>
                <div className="deck-progress">
                  {[...Array(maxCopies)].map((_, i) => (
                    <div key={i} className={`progress-pip ${i < quantityInDeck ? 'filled' : ''}`}></div>
                  ))}
                </div>
                <button 
                  className="deck-btn increase" 
                  onClick={handleIncrease}
                  disabled={quantityInDeck >= maxCopies}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="modal-stats">
              <div className="stat-item">
                <span className="stat-label">Cost</span>
                <span className="stat-value">{card.cost !== null ? card.cost : '-'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Power</span>
                <span className="stat-value">{card.power || '-'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Combo</span>
                <span className="stat-value">{card.combo || '-'}</span>
              </div>
            </div>

            {card.skill && (
              <div className="modal-skill">
                {card.skill.split('[br]').map((line: string, i: number) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
