# DBFW App (Dragon Ball Super Card Game Fusion World Deck Builder)

## Sobre o Projeto
Este é um aplicativo para a construção, gerenciamento e análise de Decks do jogo de cartas competitivo "Dragon Ball Super Card Game Fusion World" (DBFW). 
Ele possui um **Construtor de Decks Automático** usando regras de sinergia e heurísticas, e um **Analisador de Decks** empoderado por Inteligência Artificial (Gemini) para avaliar as estratégias competitivas do deck e propor melhorias seguindo o meta-game.

## Estrutura do Código e Funcionalidades Principais
- `src/App.tsx`: Gerencia o estado global do app e a mecânica manual de montagem de deck. O app valida cor, limite de cartas e regras de cópias.
- `src/components/AutoDeckWizard.tsx`: Componente que gera decks magicamente/automaticamente respeitando as cores e sinergias do líder selecionado, incluindo a verificação de Banlist e cartas Restritas em tempo real.
- `src/components/DeckAnalyzerModal.tsx`: Analisador focado em IA (usa `gemini-3.5-flash` primariamente, com fallback de alta demanda em API para `gemini-3.1-flash-lite`). Lê o deck, verifica limites ilegais, propõe substituições sinérgicas entre todas as coleções, e exporta relatórios táticos.

## Regras de Banlist e Lista de Restritas
A saúde e legalidade competitiva do deck são garantidas via um arquivo de configuração estático.

- **Arquivo de Configuração:** `src/data/banlist.ts`
- Este arquivo contém duas variáveis globais `BANNED_CARDS` (permitido 0 cópias) e `RESTRICTED_CARDS` (permitido 1 cópia máxima).

### ⚠️ Como Atualizar a Banlist (Para Agentes de IA e Devs)
Quando for solicitado verificar ou atualizar a lista de banidas e restritas:

1. **NÃO CONFIE EM DADOS GENÉRICOS DE BUSCA** - Use as URLs oficiais.
2. Acesse a URL Oficial da Bandai na sessão de Regras: 
   - [Página de Rules - DBFW Banned/Restricted Cards](https://www.dbs-cardgame.com/fw/en/rule/banned-restricted-cards/)
   - Ou verifique diretamente pelo portal de News de Regras, onde mantêm o arquivo vivo atualizado, como por exemplo: [Official Banned/Restricted News Live Updates](https://www.dbs-cardgame.com/fw/en/news/01_31.html) e [March 2026 update (example)](https://www.dbs-cardgame.com/fw/en/news/01_305.html)
3. Você **DEVE** realizar o _scrape_ e leitura do HTML/Conteúdo das URLs oficiais listadas no item acima para garantir que não perdeu o levantamento de nenhuma carta das coleções mais novas (como ocorreu com coleções FB04 ou Promos de Starter Decks).
4. Cartas com a restrição revogada (ex: FB02-013 Kefla) devem ser retiradas dos Arrays e podem ter seu comentário registrado.
5. Ao realizar um update no arquivo `src/data/banlist.ts`, sempre gere o build e rode o CI local pré-commit com `npm run build`, `npm run lint` e testes de typescript (`tsc --noEmit`).

## Tecnologias
- React, Vite, TypeScript
- Gemini API, PWA (Progressive Web App)
- Framer Motion, Tailwind (CSS/Lucide React Icons)
