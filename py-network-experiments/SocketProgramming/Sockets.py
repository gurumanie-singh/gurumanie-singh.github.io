# Introduction to Socket Programming
import socket
import sys

try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    print("socket successfully created")
except socket.error as err:
    print(f"socket creation failed with error {err}")

port = 80

try:
    host_ip = socket.gethostbyname("www.google.com")
except socket.gaierror:                                     # used in case of problem with DNS
    print("error resolving the host")
    sys.exit()
s.connect((host_ip, port))
print(f"Successfully connected on port {port} and host ip addr is {host_ip}")

