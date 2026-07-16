import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChevronRight, ChevronLeft, Check, Wand2 } from 'lucide-react';
import './AutoDeckWizard.css';

interface AutoDeckWizardProps {
  dbfwData: any[];
  onClose: () => void;
  onComplete: (deckName: string, cards: Record<string, number>) => void;
}

const COLORS = [
  { id: 'Red', name: 'Vermelho', hex: '#ff4b4b' },
  { id: 'Blue', name: 'Azul', hex: '#4b7bff' },
  { id: 'Green', name: 'Verde', hex: '#4bff4b' },
  { id: 'Yellow', name: 'Amarelo', hex: '#ffd54b' },
  { id: 'Black', name: 'Preto', hex: '#333333' }
];

const PLAYSTYLES = [
  { id: 'aggro', name: 'Agressivo (Aggro)', desc: 'Focado em atacar rápido com cartas de baixo custo.' },
  { id: 'balanced', name: 'Equilibrado (Midrange)', desc: 'Ataque e defesa balanceados, adaptável a qualquer situação.' },
  { id: 'control', name: 'Controle (Control)', desc: 'Focado em defender e dominar o fim do jogo com cartas pesadas.' }
];

export function AutoDeckWizard({ dbfwData, onClose, onComplete }: AutoDeckWizardProps) {
  const [step, setStep] = useState(1);
  const [deckName, setDeckName] = useState('Meu Deck Automático');
  const [selectedColor, setSelectedColor] = useState('Red');
  const [selectedLeader, setSelectedLeader] = useState<any>(null);
  const [playstyle, setPlaystyle] = useState('balanced');
  const [isGenerating, setIsGenerating] = useState(false);

  const availableLeaders = useMemo(() => {
    return dbfwData.filter(c => c.type === 'LEADER' && c.color === selectedColor);
  }, [dbfwData, selectedColor]);

  // Se trocar a cor e o líder selecionado não for mais dessa cor, reseta
  React.useEffect(() => {
    if (selectedLeader && selectedLeader.color !== selectedColor) {
      setSelectedLeader(null);
    }
  }, [selectedColor, selectedLeader]);

  const generateDeck = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const cards: Record<string, number> = {};
      
      // 1. Adiciona Líder (apenas 1)
      cards[selectedLeader.id] = 1;

      // Pool de cartas permitidas (da mesma cor e não líderes)
      const pool = dbfwData.filter(c => c.color === selectedColor && c.type !== 'LEADER');
      
      // Identificar Super Combos
      // Regra geral de Super Combo no JSON: Traits tem 'Super Combo' ou cost é 0 e combo_power 10000, ou é uma tag especial
      const superCombos = pool.filter(c => {
        const text = (c.skill || '').toLowerCase() + ' ' + (c.traits || '').toLowerCase();
        return text.includes('super combo');
      });

      // Se não achou por texto, pega as custo 0 combo 10k (heurística genérica)
      const scPool = superCombos.length > 0 ? superCombos : pool.filter(c => c.cost === '0' && c.combo_power === '10000');

      let cardsAdded = 0;

      // Adiciona 4 Super Combos (escolhe 1 aleatório e poe 4 cópias, se existir)
      if (scPool.length > 0) {
        const sc = scPool[Math.floor(Math.random() * scPool.length)];
        cards[sc.id] = 4;
        cardsAdded += 4;
      }

      // Remover SC do pool para não adicionar dnv
      const normalPool = pool.filter(c => !cards[c.id]);

      // Separar por custo numérico (para ignorar Extra sem custo de forma segura, default 2)
      const byCost = (costVal: number) => normalPool.filter(c => {
        const cNum = parseInt(c.cost);
        if (isNaN(cNum)) return false;
        if (costVal >= 5) return cNum >= 5;
        return cNum === costVal;
      });

      const cost1 = byCost(1);
      const cost2 = byCost(2);
      const cost3 = byCost(3);
      const cost4 = byCost(4);
      const cost5Plus = byCost(5);

      // Curvas (quantas CARTAS totais de cada custo para atingir 46 faltantes)
      const curves: Record<string, number[]> = {
        aggro: [16, 16, 10, 4, 0], // Foca no early game
        balanced: [12, 12, 10, 8, 4],
        control: [8, 10, 10, 10, 8] // Foca no late game
      };

      const targetCurve = curves[playstyle] || curves.balanced;
      const pools = [cost1, cost2, cost3, cost4, cost5Plus];

      for (let i = 0; i < pools.length; i++) {
        let needed = targetCurve[i];
        let currentPool = [...pools[i]];
        
        while (needed > 0 && currentPool.length > 0 && cardsAdded < 50) {
          const rIndex = Math.floor(Math.random() * currentPool.length);
          const card = currentPool[rIndex];
          
          const maxAdd = Math.min(4, needed, 50 - cardsAdded);
          cards[card.id] = (cards[card.id] || 0) + maxAdd;
          needed -= maxAdd;
          cardsAdded += maxAdd;
          
          // Remove from pool to prevent adding more than 4 copies in total
          currentPool.splice(rIndex, 1);
        }
      }

      // Se sobrou espaço (falta carta na cor?), preenche com o que der
      let fallbackPool = [...normalPool];
      while (cardsAdded < 50 && fallbackPool.length > 0) {
        const rIndex = Math.floor(Math.random() * fallbackPool.length);
        const card = fallbackPool[rIndex];
        const currentQty = cards[card.id] || 0;
        
        if (currentQty < 4) {
          const addAmt = Math.min(4 - currentQty, 50 - cardsAdded);
          cards[card.id] = currentQty + addAmt;
          cardsAdded += addAmt;
        }
        fallbackPool.splice(rIndex, 1);
      }

      onComplete(deckName, cards);
    }, 2000);
  };

  const nextStep = () => {
    if (step === 1 && !deckName.trim()) return;
    if (step === 3 && !selectedLeader) return;
    if (step < 4) setStep(s => s + 1);
    else generateDeck();
  };

  const prevStep = () => {
    if (step > 1) setStep(s => s - 1);
  };

  return (
    <div className="wizard-overlay">
      <motion.div 
        className="wizard-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <button className="wizard-close" onClick={onClose} disabled={isGenerating}>
          <X size={24} />
        </button>

        {isGenerating ? (
          <div className="wizard-generating">
            <Wand2 size={64} className="spin-wand" />
            <h2>Montando o seu deck ideal...</h2>
            <p>Analisando combos, ajustando a curva de custo e separando as melhores cartas.</p>
            <div className="wizard-progress-bar">
              <motion.div 
                className="wizard-progress-fill"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="wizard-header">
              <Sparkles className="wizard-icon" size={28} />
              <h2>Assistente de Deck Inteligente</h2>
              <div className="wizard-steps-indicator">
                {[1, 2, 3, 4].map(num => (
                  <div key={num} className={`step-dot ${step >= num ? 'active' : ''}`} />
                ))}
              </div>
            </div>

            <div className="wizard-body">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="wizard-step">
                    <h3>1. Dê um nome ao seu Deck</h3>
                    <input 
                      type="text" 
                      className="wizard-input" 
                      value={deckName} 
                      onChange={e => setDeckName(e.target.value)}
                      placeholder="Ex: Mono Red Goku"
                      autoFocus
                    />
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="wizard-step">
                    <h3>2. Qual será a cor do deck?</h3>
                    <div className="wizard-colors">
                      {COLORS.map(c => (
                        <button 
                          key={c.id} 
                          className={`wizard-color-btn ${selectedColor === c.id ? 'active' : ''}`}
                          style={{ '--color': c.hex } as any}
                          onClick={() => setSelectedColor(c.id)}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="wizard-step">
                    <h3>3. Escolha o seu Líder</h3>
                    <div className="wizard-leaders-grid">
                      {availableLeaders.map(leader => (
                        <div 
                          key={leader.id} 
                          className={`wizard-leader-card ${selectedLeader?.id === leader.id ? 'active' : ''}`}
                          onClick={() => setSelectedLeader(leader)}
                        >
                          <img 
                            src={leader.image || `https://multi-deckplanet.us-southeast-1.linodeobjects.com/fusion_world/${leader.id}.webp`}
                            alt={leader.name}
                            onError={(e) => { (e.target as HTMLImageElement).src = '/icon.jpg'; }}
                          />
                          {selectedLeader?.id === leader.id && <div className="selected-check"><Check size={16} /></div>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {step === 4 && (
                  <motion.div key="step4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="wizard-step">
                    <h3>4. Qual o seu estilo de jogo?</h3>
                    <div className="wizard-playstyles">
                      {PLAYSTYLES.map(p => (
                        <div 
                          key={p.id}
                          className={`wizard-playstyle-card ${playstyle === p.id ? 'active' : ''}`}
                          onClick={() => setPlaystyle(p.id)}
                        >
                          <h4>{p.name}</h4>
                          <p>{p.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="wizard-footer">
              <button className="btn-secondary" onClick={prevStep} style={{ visibility: step > 1 ? 'visible' : 'hidden' }}>
                <ChevronLeft size={20} /> Voltar
              </button>
              
              <button 
                className="btn-primary" 
                onClick={nextStep}
                disabled={(step === 1 && !deckName.trim()) || (step === 3 && !selectedLeader)}
              >
                {step === 4 ? 'Gerar Deck' : 'Próximo'} {step < 4 && <ChevronRight size={20} />}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
