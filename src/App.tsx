import { useState, useMemo, useEffect } from 'react';
import { Search, Home, Library, Settings, ChevronDown, Filter, Loader2 } from 'lucide-react';
import { DbfwCard } from './components/DbfwCard';
import { CardModal } from './components/CardModal';
import { DeckSummary } from './components/DeckSummary';
import { ProfileView } from './components/ProfileView';
import { DeckList } from './components/DeckList';
import type { SavedDeck } from './components/DeckList';
import { ViewDeckModal } from './components/ViewDeckModal';
import { useDialog } from './components/DialogContext';
import { AutoDeckWizard } from './components/AutoDeckWizard';
import { ManualDeckWizard } from './components/ManualDeckWizard';
import { BanlistViewModal } from './components/BanlistViewModal';
import { BANNED_CARDS, RESTRICTED_CARDS } from './data/banlist';
import { LeaksFeed } from './components/LeaksFeed';
import { Flame } from 'lucide-react';
import './App.css';

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Black'];
const TYPES = ['LEADER', 'BATTLE', 'EXTRA'];
const COSTS = ['0', '1', '2', '3', '4', '5', '6', '7+'];
const POWERS = ['5000', '10000', '15000', '20000', '25000', '30000', '35000', '40000+'];
const COMBOS = ['0', '5000', '10000'];
const KEYWORDS = ['Blocker', 'Critical', 'Double Strike', 'Super Combo', 'On Play', 'Permanent', 'Auto', 'Activate:Main', 'Activate:Battle'];
const PAGE_SIZE = 50;

type TabType = 'home' | 'decks' | 'profile' | 'leaks';

function App() {
  const { showAlert, showConfirm } = useDialog();
  const [dbfwData, setDbfwData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeCost, setActiveCost] = useState<string | null>(null);
  const [activePower, setActivePower] = useState<string | null>(null);
  const [activeCombo, setActiveCombo] = useState<string | null>(null);
  const [activeSeries, setActiveSeries] = useState<string | null>(null);
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAutoWizard, setShowAutoWizard] = useState(false);
  const [showManualWizard, setShowManualWizard] = useState(false);
  const [showBanlistModal, setShowBanlistModal] = useState(false);
  
  const [deck, setDeck] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('dbfw_pro_deck_v2');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>(() => {
    const saved = localStorage.getItem('dbfw_pro_saved_decks');
    let loadedDecks: SavedDeck[] = [];
    if (saved) {
      loadedDecks = JSON.parse(saved);
    }
    
    const finalDecks = [...loadedDecks];
    import('./data/premadeDecks').then(module => {
      const PREMADE_DECKS = module.PREMADE_DECKS;
      let changed = false;
      PREMADE_DECKS.forEach(premade => {
        if (!finalDecks.find(d => d.id === premade.id)) {
          finalDecks.push(premade);
          changed = true;
        }
      });
      if(changed) setSavedDecks(finalDecks);
    });

    return finalDecks;
  });
  const [isBuildingDeck, setIsBuildingDeck] = useState(false);
  const [draftDeckName, setDraftDeckName] = useState('Novo Deck');
  const [draftDeckId, setDraftDeckId] = useState<string | null>(null);
  const [viewingDeck, setViewingDeck] = useState<SavedDeck | null>(null);
  
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);

  // 1. Fetch Assíncrono dos Dados (Performance)
  useEffect(() => {
    fetch('/dbfw_data.json')
      .then(res => res.json())
      .then(data => {
        setDbfwData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar banco de dados:", err);
        setIsLoading(false);
      });
  }, []);

  const dynamicSeries = useMemo(() => {
    const seriesSet = new Set(dbfwData.map(c => c.id.split('-')[0]));
    return Array.from(seriesSet).filter(Boolean).sort();
  }, [dbfwData]);

  // 2. Debounce na Busca (Performance React)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300); // 300ms de delay
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem('dbfw_pro_deck_v2', JSON.stringify(deck));
  }, [deck]);

  useEffect(() => {
    localStorage.setItem('dbfw_pro_saved_decks', JSON.stringify(savedDecks));
  }, [savedDecks]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, activeColor, activeType, activeCost, activePower, activeCombo, activeSeries, activeKeyword, activeTab]);
  
  const allFilteredCards = useMemo(() => {
    let result = dbfwData;

    // Removido o filtro que forçava a mostrar apenas cartas do deck,
    // pois agora queremos que o usuário veja todas as cartas da cor selecionada para adicionar.
    // if (activeTab === 'decks' && isBuildingDeck) {
    //   result = result.filter(card => deck[card.id] > 0);
    // }

    if (activeColor) result = result.filter(card => card.color === activeColor);
    if (activeType) result = result.filter(card => card.type === activeType);
    
    if (activeCost) {
      if (activeCost === '7+') result = result.filter(card => card.cost >= 7);
      else result = result.filter(card => String(card.cost) === activeCost);
    }
    
    if (activePower) {
      if (activePower === '40000+') result = result.filter(card => parseInt(card.power) >= 40000);
      else result = result.filter(card => String(card.power) === activePower);
    }

    if (activeCombo) {
      result = result.filter(card => String(card.combo) === activeCombo);
    }

    if (activeSeries) {
      result = result.filter(card => card.id.startsWith(activeSeries));
    }

    if (activeKeyword) {
      result = result.filter(card => card.skill?.includes(activeKeyword));
    }

    if (debouncedSearch) {
      result = result.filter(card => 
        card.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        card.id?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    return result; 
  }, [debouncedSearch, activeColor, activeType, activeCost, activePower, activeCombo, activeSeries, activeKeyword, activeTab, deck, dbfwData]);

  const visibleCards = allFilteredCards.slice(0, visibleCount);
  const hasMore = visibleCount < allFilteredCards.length;

  const toggleColor = (color: string) => setActiveColor(prev => prev === color ? null : color);
  const toggleType = (type: string) => setActiveType(prev => prev === type ? null : type);
  const toggleCost = (cost: string) => setActiveCost(prev => prev === cost ? null : cost);
  const togglePower = (power: string) => setActivePower(prev => prev === power ? null : power);
  const toggleCombo = (combo: string) => setActiveCombo(prev => prev === combo ? null : combo);
  const toggleKeyword = (kw: string) => setActiveKeyword(prev => prev === kw ? null : kw);

  const handleLoadMore = () => setVisibleCount(prev => prev + PAGE_SIZE);

  const updateDeckCard = (card: any, quantity: number) => {
    if (quantity > 0) {
      if (BANNED_CARDS.includes(card.id)) {
        showAlert(`A carta ${card.name} (${card.id}) está banida e não pode ser adicionada ao deck.`);
        return;
      }
      if (RESTRICTED_CARDS.includes(card.id) && quantity > 1) {
        showAlert(`A carta ${card.name} (${card.id}) é restrita. Você só pode ter 1 cópia dela no deck.`);
        return;
      }
    }

    setDeck(prev => {
      const newDeck = { ...prev };
      if (quantity <= 0) {
        delete newDeck[card.id];
      } else {
        newDeck[card.id] = quantity;
      }
      return newDeck;
    });
  };

  const handleCreateDeck = () => {
    setShowManualWizard(true);
  };

  const handleManualDeckStarted = (name: string, leaderCard: any) => {
    setDraftDeckName(name);
    setDraftDeckId(null);
    setDeck({ [leaderCard.id]: 1 });
    
    // Travar na cor do líder e limpar a busca para o usuário focar nas cartas corretas
    setActiveColor(leaderCard.color);
    setSearchTerm('');
    setActiveType(null);
    setActiveCost(null);
    setActivePower(null);
    setActiveCombo(null);
    setActiveSeries(null);
    setActiveKeyword(null);
    
    setIsBuildingDeck(true);
    setShowManualWizard(false);
  };

  const handleAutoDeckGenerated = (name: string, generatedCards: Record<string, number>) => {
    setDraftDeckName(name);
    setDraftDeckId(null);
    setDeck(generatedCards);
    setIsBuildingDeck(true);
    setShowAutoWizard(false);
  };

  const handleAutoAdjustDeck = (deckId: string, newCards: Record<string, number>) => {
    setSavedDecks(prev => {
      const updated = prev.map(d => {
        if (d.id === deckId) {
          const newDeck = { ...d, cards: newCards, updatedAt: new Date().toISOString() };
          setViewingDeck(newDeck);
          return newDeck;
        }
        return d;
      });
      return updated;
    });
  };

  const handleEditDeck = (savedDeck: SavedDeck) => {
    setDraftDeckName(savedDeck.name);
    setDraftDeckId(savedDeck.id);
    setDeck(savedDeck.cards);
    setIsBuildingDeck(true);
    setViewingDeck(null);
  };

  const handleDeleteDeck = (deckId: string) => {
    setSavedDecks(prev => prev.filter(d => d.id !== deckId));
    setViewingDeck(null);
  };

  const handleSaveDeck = () => {
    setSavedDecks(prev => {
      const existingIndex = prev.findIndex(d => d.id === draftDeckId);
      const newDeck: SavedDeck = {
        id: draftDeckId || Date.now().toString(),
        name: draftDeckName,
        cards: deck
      };
      
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = newDeck;
        return next;
      }
      return [...prev, newDeck];
    });
    
    setIsBuildingDeck(false);
    setDeck({});
    setDraftDeckId(null);
  };

  const handleCancelDeck = () => {
    showConfirm('Tem certeza que deseja cancelar a edição? As alterações não serão salvas.', () => {
      setIsBuildingDeck(false);
      setDeck({});
      setDraftDeckId(null);
    });
  };

  if (isLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <Loader2 size={48} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        <h2 style={{ color: 'var(--text-muted)' }}>Sincronizando Banco de Dados...</h2>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="top-header glass-panel">
        <h1 className="header-title">
          {activeTab === 'decks' ? (isBuildingDeck ? 'Editando Deck' : 'Meus Decks') : activeTab === 'profile' ? 'Perfil' : activeTab === 'leaks' ? 'Leaks' : 'DBFW'} <span>Pro</span>
        </h1>
        
        {activeTab !== 'profile' && activeTab !== 'leaks' && !(activeTab === 'decks' && !isBuildingDeck) && (
          <>
            <div className="search-bar-container">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filters-container">
              {COLORS.map(color => (
                <button 
                  key={color} 
                  className={`filter-pill ${activeColor === color ? 'active' : ''}`}
                  onClick={() => toggleColor(color)}
                >
                  <span className={`color-dot ${color}`} style={{ marginRight: '6px' }}></span>
                  {color}
                </button>
              ))}
              {TYPES.map(type => (
                <button 
                  key={type} 
                  className={`filter-pill ${activeType === type ? 'active' : ''}`}
                  onClick={() => toggleType(type)}
                >
                  {type}
                </button>
              ))}
              <button 
                className={`filter-pill ${showAdvancedFilters ? 'active' : ''}`}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                style={{ marginLeft: 'auto', border: '1px solid var(--accent)' }}
              >
                <Filter size={16} /> Avançado
              </button>
            </div>

            {showAdvancedFilters && (
              <div className="advanced-filters-panel">
                <div className="filter-group">
                  <h4>Custo de Energia</h4>
                  <div className="filter-options">
                    {COSTS.map(cost => (
                      <button key={cost} className={`filter-pill ${activeCost === cost ? 'active' : ''}`} onClick={() => toggleCost(cost)}>
                        {cost}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="filter-group">
                  <h4>Poder (Power)</h4>
                  <div className="filter-options">
                    {POWERS.map(pwr => (
                      <button key={pwr} className={`filter-pill ${activePower === pwr ? 'active' : ''}`} onClick={() => togglePower(pwr)}>
                        {pwr}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="filter-group">
                  <h4>Poder de Combo</h4>
                  <div className="filter-options">
                    {COMBOS.map(cmb => (
                      <button key={cmb} className={`filter-pill ${activeCombo === cmb ? 'active' : ''}`} onClick={() => toggleCombo(cmb)}>
                        {cmb}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="filter-group">
                  <h4>Série (Coleção)</h4>
                  <select 
                    className="filter-select"
                    value={activeSeries || ''} 
                    onChange={(e) => setActiveSeries(e.target.value || null)}
                  >
                    <option value="">Todas as Séries</option>
                    {dynamicSeries.map(series => (
                      <option key={series} value={series}>{series}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <h4>Keywords (Habilidades)</h4>
                  <div className="filter-options">
                    {KEYWORDS.map(kw => (
                      <button key={kw} className={`filter-pill ${activeKeyword === kw ? 'active' : ''}`} onClick={() => toggleKeyword(kw)}>
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </header>

      <main className="cards-grid">
        {activeTab === 'decks' && isBuildingDeck && (
          <div style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ color: 'var(--text)' }}>{draftDeckName}</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-secondary" onClick={handleCancelDeck} style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-muted)' }}>Cancelar</button>
                  <button className="btn-primary" onClick={handleSaveDeck}>Salvar Deck</button>
                </div>
             </div>
             <DeckSummary deckState={deck} cardsData={dbfwData} />
          </div>
        )}

        {activeTab === 'decks' && !isBuildingDeck && (
          <div style={{ gridColumn: '1 / -1' }}>
             <DeckList 
                decks={savedDecks} 
                dbfwData={dbfwData}
                onCreateClick={handleCreateDeck}
                onDeckClick={(d) => setViewingDeck(d)}
                onAutoGenerateClick={() => setShowAutoWizard(true)}
             />
          </div>
        )}
        
        {activeTab === 'profile' ? (
          <ProfileView 
            onViewBanlist={() => setShowBanlistModal(true)}
          />
        ) : activeTab === 'leaks' ? (
          <LeaksFeed />
        ) : activeTab === 'decks' && !isBuildingDeck ? null : (
          <>
            {activeTab === 'decks' && isBuildingDeck ? (
              <>
                <div style={{ gridColumn: '1 / -1', marginTop: '8px', marginBottom: '8px' }}>
                  <h4 style={{ color: 'var(--text)', borderBottom: '2px solid var(--accent)', paddingBottom: '4px' }}>
                    Cartas Disponíveis (Toque para Adicionar/Remover)
                  </h4>
                </div>
                {visibleCards.filter(c => c.type !== 'LEADER').map(card => (
                  <DbfwCard key={card.id} card={card} onClick={setSelectedCard} quantity={deck[card.id]} />
                ))}
              </>
            ) : (
              <>
                {visibleCards.map((card) => (
                  <DbfwCard key={card.id} card={card} onClick={setSelectedCard} quantity={activeTab === 'home' && deck[card.id] ? deck[card.id] : undefined} />
                ))}
              </>
            )}
            {visibleCards.length === 0 && activeTab === 'decks' && isBuildingDeck && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)' }}>
                Seu deck está vazio. Vá para Início e adicione algumas cartas!
              </div>
            )}
            {visibleCards.length === 0 && activeTab === 'home' && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)' }}>
                Nenhuma carta encontrada com esses filtros.
              </div>
            )}
          </>
        )}
      </main>

      {hasMore && activeTab !== 'profile' && activeTab !== 'leaks' && !(activeTab === 'decks' && !isBuildingDeck) && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0 64px 0' }}>
          <button 
            onClick={handleLoadMore}
            className="filter-pill active"
            style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}
          >
            Carregar Mais Cartas <ChevronDown size={18} />
          </button>
        </div>
      )}

      <nav className="bottom-nav glass-panel">
        <a 
          href="#" 
          aria-label="Ir para Início"
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}
        >
          <Home size={24} />
          <span>Início</span>
        </a>
        <a 
          href="#" 
          aria-label="Ver Decks"
          className={`nav-item ${activeTab === 'decks' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('decks'); }}
        >
          <Library size={24} />
          <span>Decks</span>
        </a>
        <a 
          href="#" 
          aria-label="Spoilers & Leaks"
          className={`nav-item ${activeTab === 'leaks' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('leaks'); }}
        >
          <Flame size={24} />
          <span>Leaks</span>
        </a>
        <a 
          href="#" 
          aria-label="Abrir Perfil"
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}
        >
          <Settings size={24} />
          <span>Perfil</span>
        </a>
      </nav>

      <CardModal 
        card={selectedCard} 
        onClose={() => setSelectedCard(null)} 
        quantityInDeck={selectedCard ? (deck[selectedCard.id] || 0) : 0}
        onUpdateDeck={updateDeckCard}
      />

      {viewingDeck && (
        <ViewDeckModal
          deck={viewingDeck}
          dbfwData={dbfwData}
          onClose={() => setViewingDeck(null)}
          onEdit={handleEditDeck}
          onDelete={handleDeleteDeck}
          onCardClick={setSelectedCard}
          onAutoAdjust={(newCards) => handleAutoAdjustDeck(viewingDeck.id, newCards)}
        />
      )}

      {showAutoWizard && (
        <AutoDeckWizard 
          dbfwData={dbfwData}
          onClose={() => setShowAutoWizard(false)}
          onComplete={handleAutoDeckGenerated}
        />
      )}

      {showManualWizard && (
        <ManualDeckWizard 
          dbfwData={dbfwData}
          onClose={() => setShowManualWizard(false)}
          onComplete={handleManualDeckStarted}
        />
      )}

      {showBanlistModal && (
        <BanlistViewModal
          dbfwData={dbfwData}
          onClose={() => setShowBanlistModal(false)}
        />
      )}
    </div>
  );
}

export default App;
