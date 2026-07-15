import json

file_path = 'src/data/dbfw_data.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total original: {len(data)}")

unique_cards = {}
for card in data:
    card_id = card.get('id')
    if card_id not in unique_cards:
        unique_cards[card_id] = card

deduped_list = list(unique_cards.values())
print(f"Total deduplicado: {len(deduped_list)}")

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(deduped_list, f, indent=4, ensure_ascii=False)

print("dbfw_data.json limpo com sucesso!")
