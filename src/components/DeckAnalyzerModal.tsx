import { useState, useEffect } from 'react';
import { X, Wand2, Key, Loader2, Trash2, Sparkles, Copy, Share2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { BANNED_CARDS, RESTRICTED_CARDS } from '../data/banlist';
import './DeckAnalyzerModal.css';

interface DeckAnalyzerModalProps {
  deck: { name: string; cards: Record<string, number> };
  dbfwData: any[];
  onClose: () => void;
  onUpdateDeck?: (newCards: Record<string, number>) => void;
}

export function DeckAnalyzerModal({ deck, dbfwData, onClose, onUpdateDeck }: DeckAnalyzerModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setHasKey(true);
    }
  }, []);

  const saveKey = () => {
    if (apiKey.trim().length > 10) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setHasKey(true);
      setError('');
    } else {
      setError('Por favor, insira uma chave de API válida.');
    }
  };

  const removeKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setHasKey(false);
    setAnalysis('');
  };

  const analyzeDeck = async () => {
    if (!hasKey || !apiKey) return;
    
    setIsAnalyzing(true);
    setAnalysis('');
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      // Preparar a lista do deck
      const cardIds = Object.keys(deck.cards).filter(id => deck.cards[id] > 0);
      let deckListText = '';
      
      const leaderCard = dbfwData.find(c => c.type === 'LEADER' && deck.cards[c.id] > 0);
      if (leaderCard) {
        deckListText += `Líder: ${leaderCard.name} (${leaderCard.id}) - Cor: ${leaderCard.color} - Efeito: ${leaderCard.skill}\n\nCartas do Deck:\n`;
      } else {
        deckListText += `Cartas do Deck:\n`;
      }

      cardIds.forEach(id => {
        const card = dbfwData.find(c => c.id === id);
        if (card && card.type !== 'LEADER') {
          deckListText += `- ${deck.cards[id]}x ${card.name} [${card.id}] (${card.type}, Cost: ${card.cost || 0}, Power: ${card.power || 0}, Combo: ${card.combo_power || 0})\n  Efeito: ${card.skill || 'Nenhum'}\n`;
        }
      });

      const prompt = `Atue como um jogador profissional e analista de Dragon Ball Super Card Game Fusion World (DBFW). 
Eu construí o seguinte deck:
Nome do Deck: ${deck.name}

${deckListText}

Por favor, faça uma análise detalhada deste deck abordando obrigatoriamente os seguintes pontos:
1. **Estratégia Principal:** Qual é a principal condição de vitória e como o deck deve jogar.
2. **Pontos Fortes (Sinergias):** Quais cartas combam melhor entre si e quais são as maiores vantagens do deck.
3. **Fraquezas:** Quais matchups ou situações podem ser difíceis para este deck e por que.
4. **Dicas de Mulligan:** Quais cartas eu devo sempre buscar manter na mão inicial.
5. **Regras e Banlist:** Verifique se o deck possui no máximo 4 cópias da mesma carta e no máximo 4 cartas com [Super Combo]. Além disso, verifique a Banlist oficial (Cartas Banidas: ${BANNED_CARDS.length > 0 ? BANNED_CARDS.join(', ') : 'Nenhuma'} | Cartas Restritas a 1 cópia: ${RESTRICTED_CARDS.length > 0 ? RESTRICTED_CARDS.join(', ') : 'Nenhuma'}). Avise se o deck for ilegal.

Responda em português do Brasil, usando formatação Markdown (com títulos, listas e negritos) para deixar a leitura agradável e direta. Não precisa inventar regras, use seu conhecimento das mecânicas de jogos de cartas e da estrutura do DBFW baseada nos status/efeitos listados.`;

      const generate = async (modelName: string) => {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContentStream(prompt);
        let fullText = '';
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          setAnalysis(fullText);
        }
      };

      try {
        await generate('gemini-3.5-flash');
      } catch (err: any) {
        if (err.message && err.message.includes('503')) {
          console.log("3.5-flash is busy, falling back to gemini-3.1-flash-lite...");
          await generate('gemini-3.1-flash-lite');
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('API key not valid')) {
        setError('Erro: A sua API Key é inválida. Por favor, verifique se você copiou corretamente.');
      } else if (err.message && err.message.includes('not found')) {
        setError(`Erro de Modelo: ${err.message}. A sua conta pode não ter acesso a este modelo ainda.`);
      } else if (err.message && err.message.includes('503')) {
        setError('O servidor do Google Gemini está com muita demanda no momento (503), e os modelos de backup também falharam. Por favor, aguarde alguns segundos e tente novamente.');
      } else {
        setError(`Erro na requisição: ${err.message || 'Falha desconhecida'}. Se for erro de permissão (403), você precisa ativar a API "Generative Language API" no Google Cloud Console.`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis)
      .then(() => alert('Relatório copiado para a área de transferência!'))
      .catch(() => alert('Erro ao copiar relatório.'));
  };

  const handleShare = () => {
    if (typeof navigator.share === 'function') {
      navigator.share({
        title: `Análise do Deck: ${deck.name}`,
        text: analysis,
      }).catch(err => console.log('Erro ao compartilhar:', err));
    } else {
      handleCopy();
    }
  };

  const autoAdjustDeck = async () => {
    if (!hasKey || !apiKey || !onUpdateDeck) return;
    
    setIsAdjusting(true);
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      const leaderCard = dbfwData.find(c => c.type === 'LEADER' && deck.cards[c.id] > 0);
      if (!leaderCard) throw new Error("Deck sem líder válido.");

      // Filtrar cartas da base que são da cor do líder para passar como opções
      // Reduzindo campos para poupar tokens
      const validCards = dbfwData
        .filter(c => c.color === leaderCard.color || c.type === 'LEADER')
        .map(c => ({ id: c.id, name: c.name, type: c.type, superCombo: c.skill?.includes('[Super Combo]') }));

      const adjustPrompt = `Você analisou o deck "${deck.name}" e propôs melhorias (removendo cartas mortas, consertando o limite de 4 super combos, adicionando opções de maior impacto, etc).
Agora, atue como um bot de auto-correção e gere a NOVA LISTA de cartas completa baseada nas suas próprias recomendações.
O deck precisa ter exatamente 1 Líder e entre 50 a 60 cartas no total. Limite de no máximo 4 cópias da mesma carta. Máximo de 4 Super Combos totais.
Respeite também a Banlist oficial: 
- Cartas Banidas (0 cópias permitidas): ${BANNED_CARDS.length > 0 ? BANNED_CARDS.join(', ') : 'Nenhuma'}
- Cartas Restritas (máx 1 cópia): ${RESTRICTED_CARDS.length > 0 ? RESTRICTED_CARDS.join(', ') : 'Nenhuma'}

Para te ajudar, aqui está o catálogo de cartas que você pode usar (todas as cartas da cor do líder, use de todas as coleções listadas aqui):
${JSON.stringify(validCards)}

Retorne EXCLUSIVAMENTE um objeto JSON válido representando o novo deck no seguinte formato (substituindo os dados):
{
  "cards": {
    "${leaderCard.id}": 1,
    "ID_DA_CARTA": QUANTIDADE
  }
}
NÃO RETORNE TEXTO NENHUM ANTES NEM DEPOIS DO JSON. NÃO USE BLOCOS \`\`\`json. APENAS O OBJETO VALIDÁVEL.`;

      const adjust = async (modelName: string) => {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(adjustPrompt);
        return result.response.text().trim();
      };

      let textResponse = '';
      try {
        textResponse = await adjust('gemini-3.5-flash');
      } catch (err: any) {
        if (err.message && err.message.includes('503')) {
          console.log("3.5-flash is busy, falling back to gemini-3.1-flash-lite...");
          textResponse = await adjust('gemini-3.1-flash-lite');
        } else {
          throw err;
        }
      }
      
      // Limpar marcações caso a IA mande ```json
      let jsonStr = textResponse;
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '');
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '');
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.replace(/```$/, '');
      jsonStr = jsonStr.trim();

      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.cards) {
        onUpdateDeck(parsed.cards);
        alert('Seu deck foi atualizado magicamente pela IA!');
        onClose(); // Fechar o modal após atualizar
      } else {
        throw new Error("Formato JSON inválido.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('503')) {
        setError('A inteligência artificial está superlotada no momento (Erro 503). O modelo de backup também falhou. Tente clicar no botão novamente em alguns segundos!');
      } else {
        setError(`Erro ao auto-ajustar deck: ${err.message}`);
      }
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="analyzer-modal-overlay" onClick={onClose}>
      <div className="analyzer-modal-content" onClick={e => e.stopPropagation()}>
        <div className="analyzer-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Wand2 className="analyzer-icon" />
            <h3>Análise de IA: {deck.name}</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="analyzer-modal-body">
          {!hasKey ? (
            <div className="api-key-setup">
              <div className="api-key-icon-wrapper">
                <Key size={48} />
              </div>
              <h4>Configurar Inteligência Artificial</h4>
              <p>
                Para analisar seu deck usando o <strong>Google Gemini</strong> de forma gratuita, 
                você precisa informar sua Chave de API (API Key). 
                Esta chave fica salva apenas no seu navegador localmente.
              </p>
              
              <div className="api-key-input-group">
                <input 
                  type="password" 
                  placeholder="Cole sua API Key do Gemini aqui..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button className="btn-primary" onClick={saveKey}>Salvar Chave</button>
              </div>
              {error && <p className="error-msg">{error}</p>}
              
              <div className="api-key-help">
                <p>Não tem uma chave? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Pegue uma gratuitamente no Google AI Studio.</a></p>
              </div>
            </div>
          ) : (
            <div className="analysis-container">
              <div className="analysis-controls">
                <button 
                  className="btn-primary start-analysis-btn" 
                  onClick={analyzeDeck} 
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <><Loader2 className="spin" size={18} /> Analisando Deck...</>
                  ) : (
                    <><Wand2 size={18} /> Gerar Relatório de Estratégia</>
                  )}
                </button>
                
                <button className="btn-icon danger" onClick={removeKey} title="Remover API Key" style={{ padding: '8px 16px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>
                  <Trash2 size={18} /> <span style={{fontSize: '12px', marginLeft: '6px'}}>Remover Key</span>
                </button>
              </div>
              
              {error && <div className="error-msg" style={{marginTop: '16px'}}>{error}</div>}

              {analysis && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {onUpdateDeck && (
                    <button className="btn-primary" title="Aplicar Melhorias Automaticamente" onClick={autoAdjustDeck} disabled={isAdjusting} style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                      {isAdjusting ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                      <span style={{ marginLeft: '6px' }}>Auto-Ajustar Deck</span>
                    </button>
                  )}
                  <button className="btn-icon" title="Copiar Análise" onClick={handleCopy} style={{ background: 'rgba(0,0,0,0.1)', padding: '8px 16px', display: 'flex', alignItems: 'center', borderRadius: '8px' }}>
                    <Copy size={16} /> <span style={{fontSize: '13px', marginLeft:'6px'}}>Copiar</span>
                  </button>
                  {typeof navigator.share === 'function' && (
                    <button className="btn-icon" title="Compartilhar" onClick={handleShare} style={{ background: 'rgba(0,0,0,0.1)', padding: '8px 16px', display: 'flex', alignItems: 'center', borderRadius: '8px' }}>
                      <Share2 size={16} /> <span style={{fontSize: '13px', marginLeft:'6px'}}>Compartilhar</span>
                    </button>
                  )}
                </div>
              )}

              {analysis && (
                <div className="markdown-output">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              )}
              
              {!analysis && !isAnalyzing && !error && (
                <div className="analysis-empty-state">
                  <Sparkles size={32} style={{ opacity: 0.5, marginBottom: '16px' }} />
                  <p>Clique no botão acima para que a IA analise a sinergia, curva de mana e estratégia do seu deck baseado no texto e código de cada carta.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
