import requests

url = "https://multi-deckplanet.us-southeast-1.linodeobjects.com/fusion_world/FB02-044_b.webp"
headers = {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://www.deckplanet.net/"
}

print(f"Testing URL: {url}")
r1 = requests.get(url)
print(f"Without Referer: Status Code {r1.status_code}")

r2 = requests.get(url, headers=headers)
print(f"With Referer: Status Code {r2.status_code}")

# Let's also check if the image might have a different extension or no _b
url2 = "https://multi-deckplanet.us-southeast-1.linodeobjects.com/fusion_world/FB02-044.webp"
r3 = requests.get(url2)
print(f"Without _b: Status Code {r3.status_code}")
