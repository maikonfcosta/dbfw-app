# 🐉 DBFW Pro - Dragon Ball Fusion World Deck Builder

![DBFW Pro](public/icon.jpg)

**DBFW Pro** é um Progressive Web App (PWA) de alto desempenho criado para ser o assistente definitivo de jogadores do Card Game *Dragon Ball Fusion World*. Com um visual Premium "Glassmorphism", ele oferece uma base de dados completa (Off-line) com +1.800 cartas, montagem de Decks, filtros avançados e animações 3D de alta fluidez.

---

## ✨ Features Principais

* 🗃️ **Banco de Dados Completo:** Navegue por 1.892 cartas exclusivas, atualizadas e livres de duplicatas.
* 🔎 **Filtros Avançados Dinâmicos:** Filtre por Série, Keywords (Habilidades), Custo, Poder, Cor e Tipo em tempo real.
* 🃏 **Deck Builder Inteligente:** 
  * Validação automática de 50 cartas + 1 Líder.
  * Estatísticas em tempo real (Curva de Energia e Pizza de Cores).
  * Limite de máximo 4 cópias por carta.
* 🔄 **Efeitos Visuais e Flip 3D:** Clique na carta de Líder no construtor de deck para ver a mecânica de *Awaken* (Despertar) com rotação 3D usando `framer-motion`.
* ⚡ **Ultra Performance:** Otimizado com `React.memo`, *Debounce* de busca e carregamento assíncrono para garantir fluidez total em dispositivos móveis.
* 📱 **PWA e Modo Offline:** Instale no celular e utilize sem conexão à internet! Os dados e imagens ficam em cache no dispositivo.
* 📤 **Exportação:** Copie seu deck em JSON com 1 clique para compartilhar.

---

## 🛠️ Tecnologias Utilizadas

* **React + Vite:** Empacotador e framework moderno.
* **TypeScript:** Tipagem estática para robustez.
* **Framer Motion:** Animações fluidas, como o Flip 3D do Líder.
* **Lucide React:** Ícones modernos e limpos.
* **Vite-Plugin-PWA:** Geração automática do Service Worker.
* **CSS Vanilla (Glassmorphism):** Estilização feita do zero, com variáveis HSL, temas escuros e efeitos de vidro fosco.

---

## 🚀 Como Rodar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/maikonfcosta/dbfw-app.git
```
2. Entre na pasta:
```bash
cd dbfw-app
```
3. Instale as dependências:
```bash
npm install
```
4. Rode o servidor de desenvolvimento:
```bash
npm run dev
```

---

## 📜 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---
*Desenvolvido com 💙 por [Maikon Costa](https://github.com/maikonfcosta) para a comunidade DBFW.*
