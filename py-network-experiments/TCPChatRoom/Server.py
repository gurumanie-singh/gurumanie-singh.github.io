# Chat Room Connection - Client to Client
import threading
import socket

host = "0.0.0.0"
port = 59000
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind((host, port))
server.listen()
clients = []
aliases = []

def broadcast(message):
    for client in clients:
        client.send(message)

# Function to handle Clients' connections
def handle_client(client):
    while True:
        try:
            message = client.recv(1024)
            broadcast(message)
        except:
            index = clients.index(client)
            clients.remove(client)
            client.close()
            alias = aliases[index]
            broadcast(f"{alias} has left this chat!".encode("utf-8"))
            aliases.remove(alias)
            break

# Main function to receive clients connection
def receive():
    while True:
        print("Server is running and listening...")
        client, address = server.accept()
        print(f"Connection is established with {str(address)}")
        client.send("Alias?".encode("utf-8"))
        alias = client.recv(1024)
        aliases.append(alias)
        clients.append(client)
        print(f"The alias of this client is {alias}".encode("utf-8"))
        broadcast(f"{alias} has connected to the chat!\n".encode("utf-8"))
        client.send("You are now connected!".encode("utf-8"))
        thread = threading.Thread(target = handle_client, args = (client,))
        thread.start()

if __name__ == "__main__":
    receive()