#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define PORT 8080
#define BUFFER_SIZE 1024

int main() {
    int serverSocket, clientSocket;
    struct sockaddr_in serverAddr, clientAddr;
    socklen_t clientAddrLen = sizeof(clientAddr);
    char uptimeOutput[BUFFER_SIZE];

    // Create a basic TCP socket
    serverSocket = socket(PF_INET, SOCK_STREAM, 0);
    if (serverSocket < 0) {
        perror("socket() failed");
        return -1;
    }

    // Set up our server address
    memset(&serverAddr, 0, sizeof(serverAddr));
    serverAddr.sin_family = PF_INET;
    serverAddr.sin_port = htons(PORT);
    serverAddr.sin_addr.s_addr = INADDR_ANY;

    // Bind the socket to our address
    if (bind(serverSocket, (struct sockaddr *)&serverAddr, sizeof(serverAddr)) < 0) {
        perror("bind() failed");
        close(serverSocket);
        return -1;
    }

    // Listen for incoming connections
    if (listen(serverSocket, 5) < 0) {
        perror("listen() failed");
        close(serverSocket);
        return -1;
    }

    printf("ruptimeServer listening on port %d...\n", PORT);

    // Loop indefinitely, handling one client at a time
    while (1) {
        // Block until our client eventually connects
        clientSocket = accept(serverSocket, (struct sockaddr *)&clientAddr, &clientAddrLen);
        if (clientSocket < 0) {
            perror("accept() failed");
            continue; // don't exit and instead try accepting the next connection
        }

        printf("Client connected.\n");

        // Run uptime and capture the output into uptimeOutput
        FILE *pipe = popen("uptime", "r");
        if (pipe == NULL) {
            perror("popen() failed");
            close(clientSocket);
            continue;
        }

        memset(uptimeOutput, 0, sizeof(uptimeOutput));
        fgets(uptimeOutput, BUFFER_SIZE, pipe);
        pclose(pipe);

        // Send the uptime string to our client
        if (send(clientSocket, uptimeOutput, strlen(uptimeOutput), 0) < 0) {
            perror("send() failed");
        }

        close(clientSocket);
    }

    close(serverSocket);
    return 0;
}