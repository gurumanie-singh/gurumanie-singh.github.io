import socket

s = socket.socket()
print("Socket successfully created!")

port = 56789
s.bind(("",port))

print(f"Socket binded to port {port}")
s.listen(5)
print("Socket is listening")

while True:
    c, addr = s.accept()
    print("Got connection from", addr)
    message = "Thank you for connecting with us"
    c.send(message.encode())
    c.close()

    

