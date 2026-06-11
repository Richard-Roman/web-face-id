import requests

files = [
    ('imagenes', ('test1.jpg', b'fake image data 1', 'image/jpeg')),
    ('imagenes', ('test2.jpg', b'fake image data 2', 'image/jpeg'))
]

res = requests.post("http://34.41.144.88:8089/evaluar-lote", files=files)
print("Status:", res.status_code)
print("Response:", res.text)
