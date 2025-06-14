# Introduction to Socket Programming
import socket
import sys

try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)   # AF_NET used for IPv4 addresses, SOCK_STREAM used for TCP connections
    print("socket successfully created")
except socket.error as err:
    print(f"socket creation failed with error {err}")

# port = 80   # HTTP port
port = 443  # HTTPS port

try:
    host_ip = socket.gethostbyname("www.google.com")        # to perform DNS resolution (convert google.com to 127.766.1.1)
except socket.gaierror:                                     # used in case of problem with DNS
    print("error resolving the host")
    sys.exit()
s.connect((host_ip, port))                                  # tell socket to make connection with specified host ip and port
print(f"Successfully connected on Port {port} and Host IP address is {host_ip}")