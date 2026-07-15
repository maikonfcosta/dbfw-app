import json

file_path = r"C:\Users\maiki\Documents\PESSOAL\dbfw-app\src\data\dbfw_data.json"

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

for card in data:
    # A imagem da frente não tem o "_b" no final. O "_b" é apenas para as costas dos Líderes (Awakened).
    card["image"] = card["image"].replace("_b.webp", ".webp")

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Imagens corrigidas com sucesso no JSON!")
