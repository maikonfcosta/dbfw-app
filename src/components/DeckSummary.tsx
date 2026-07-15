import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import './DeckSummary.css';

interface DeckSummaryProps {
  deckState: Record<string, number>;
  cardsData: any[];
}

export const DeckSummary: React.FC<DeckSummaryProps> = ({ deckState, cardsData }) => {
  // Obter detalhes das cartas que estão no deck
  const deckCards = cardsData.filter(card => deckState[card.id] > 0);
  
  let leaderCount = 0;
  let battleCount = 0;
  let extraCount = 0;

  deckCards.forEach(card => {
    const qty = deckState[card.id];
    if (card.type === 'LEADER') leaderCount += qty;
    if (card.type === 'BATTLE') battleCount += qty;
    if (card.type === 'EXTRA') extraCount += qty;
  });

  const totalMainDeck = battleCount + extraCount; // O líder não entra na contagem principal (50-60)
  
  // Regras DBFW: 1 Líder e Exatamente 50 cartas no Main Deck
  const hasLeader = leaderCount === 1;
  const isMainDeckValid = totalMainDeck === 50;
  const isValidDeck = hasLeader && isMainDeckValid;

  const progressPercentage = Math.min((totalMainDeck / 50) * 100, 100);
  
  let fillClass = '';
  if (totalMainDeck === 50) fillClass = 'complete';
  if (totalMainDeck > 50) fillClass = 'over';

  return (
    <div className="deck-summary-container">
      <div className="deck-summary-top">
        <div className="deck-summary-title">
          Análise do Deck
        </div>
        <div className={`deck-validity-badge ${isValidDeck ? 'valid' : 'invalid'}`}>
          {isValidDeck ? (
            <><ShieldCheck size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> Válido</>
          ) : (
            <><AlertCircle size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> Inválido</>
          )}
        </div>
      </div>

      <div className="deck-size-bar-container">
        <div className="deck-size-label">
          <span>Main Deck (Battle/Extra)</span>
          <span style={{ color: totalMainDeck > 50 ? 'var(--color-red)' : totalMainDeck === 50 ? '#00ff80' : 'var(--text-muted)' }}>
            {totalMainDeck} / 50
          </span>
        </div>
        <div className="deck-size-bar">
          <div className={`deck-size-fill ${fillClass}`} style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      <div className="deck-stats-grid">
        <div className="stat-box">
          <span className="stat-box-label">Líder</span>
          <span className="stat-box-value" style={{ color: leaderCount === 1 ? '#00ff80' : 'var(--color-red)' }}>
            {leaderCount} / 1
          </span>
        </div>
        <div className="stat-box">
          <span className="stat-box-label">Battle Cards</span>
          <span className="stat-box-value">{battleCount}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box-label">Extra Cards</span>
          <span className="stat-box-value">{extraCount}</span>
        </div>
      </div>
    </div>
  );
};
