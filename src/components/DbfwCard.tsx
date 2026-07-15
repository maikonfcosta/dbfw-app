import React from 'react';
import { motion } from 'framer-motion';
import './DbfwCard.css';

interface CardProps {
  card: {
    id: string;
    name: string;
    image: string;
    color: string;
    cost: number;
    power: string;
    type: string;
  };
  onClick: (card: any) => void;
}

// React.memo previne re-renderizações desnecessárias das cartas quando o usuário digita na busca
export const DbfwCard: React.FC<CardProps> = React.memo(({ card, onClick }) => {
  return (
    <motion.div 
      className="card-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,240,255,0.2)" }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(card)}
    >
      <img src={card.image} alt={card.name} className="card-image" loading="lazy" />
      <div className="card-overlay">
        <span className="card-name">{card.name}</span>
        <div className="card-meta">
          <span className={`color-dot ${card.color}`}></span>
          {card.cost !== null && <span className="card-cost">Cost: {card.cost}</span>}
          {card.power && <span style={{ fontSize: '0.7rem' }}>PWR: {card.power}</span>}
        </div>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Comparações rasas otimizadas
  return prevProps.card.id === nextProps.card.id;
});
