const fs = require('fs');

const dataPath = '../public/dbfw_data.json';
const outputPath = '../src/data/premadeDecks.ts';

const cards = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

function getCardsByPrefix(prefix) {
  return cards.filter(c => c.id.startsWith(prefix));
}

function buildDeck(id, name, leaderId, pool, budget = false) {
  const deckCards = {};
  deckCards[leaderId] = 1;
  
  let count = 0;
  
  const battleCards = pool.filter(c => c.type === 'BATTLE');
  const extraCards = pool.filter(c => c.type === 'EXTRA');
  
  for (const c of battleCards) {
    if (count >= 50) break;
    const qty = Math.min(4, 50 - count);
    deckCards[c.id] = qty;
    count += qty;
  }
  
  for (const c of extraCards) {
    if (count >= 50) break;
    const qty = Math.min(4, 50 - count);
    deckCards[c.id] = qty;
    count += qty;
  }
  
  return {
    id,
    name,
    cards: deckCards
  };
}

const premadeDecks = [];

// Dynamically generate all Starter Decks from FS01 to FS12
const starterPrefixes = ['FS01','FS02','FS03','FS04','FS05','FS06','FS07','FS08','FS09','FS10','FS11','FS12'];
for (const prefix of starterPrefixes) {
  const pool = getCardsByPrefix(prefix);
  if (pool.length > 0) {
    const leader = pool.find(c => c.type === 'LEADER');
    if (leader) {
      premadeDecks.push(buildDeck(`starter-${prefix.toLowerCase()}`, `Starter Deck: ${leader.name} (${leader.color})`, leader.id, pool));
    }
  }
}

// Meta Decks
const redCards = cards.filter(c => c.color === 'Red' && (c.id.startsWith('FB03') || c.id.startsWith('FB02') || c.id.startsWith('FB01')));
const jirenLeader = cards.find(c => c.type === 'LEADER' && c.name.includes('Jiren'));
if (jirenLeader) {
  premadeDecks.push(buildDeck('meta-jiren', 'Meta: Jiren Control (FB03)', jirenLeader.id, redCards));
}

const yellowCards = cards.filter(c => c.color === 'Yellow' && (c.id.startsWith('FB01') || c.id.startsWith('FB02')));
const friezaLeader = cards.find(c => c.type === 'LEADER' && c.id === 'FB01-104');
if (friezaLeader) {
  premadeDecks.push(buildDeck('meta-frieza', 'Meta: Frieza Aggro (FB02)', friezaLeader.id, yellowCards));
}

// Budget Deck
const budgetGreen = cards.filter(c => c.color === 'Green' && (c.rarity === 'C' || c.rarity === 'UC' || c.id.startsWith('FS')));
const brolyLeader = cards.find(c => c.type === 'LEADER' && c.id === 'FS03-01');
if (brolyLeader) {
  premadeDecks.push(buildDeck('budget-broly', 'Budget: Broly Ramp', brolyLeader.id, budgetGreen));
}

const fileContent = `import type { SavedDeck } from '../components/DeckList';\n\nexport const PREMADE_DECKS: SavedDeck[] = ${JSON.stringify(premadeDecks, null, 2)};\n`;

fs.writeFileSync(outputPath, fileContent);
console.log('premadeDecks.ts updated with all starters!');
