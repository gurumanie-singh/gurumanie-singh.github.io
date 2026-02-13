#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT 8080
#define BUFFER_SIZE 1024

int main(int argc, char *argv[]) {
    // Usage: ./ruptimeClient <server_ip>
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <server_ip>\n", argv[0]);
        return -1;
    }

    int clientSocket;
    struct sockaddr_in serverAddress;
    char buffer[BUFFER_SIZE];

    // Create a basic TCP socket
    clientSocket = socket(PF_INET, SOCK_STREAM, 0);
    if (clientSocket < 0) {
        perror("socket() failed");
        return -1;
    }

    // Set up our server address using the IP passed in as an argument
    memset(&serverAddress, 0, sizeof(serverAddress));
    serverAddress.sin_family = PF_INET;
    serverAddress.sin_port = htons(PORT);
    serverAddress.sin_addr.s_addr = inet_addr(argv[1]);

    // Connect to our server
    if (connect(clientSocket, (struct sockaddr *)&serverAddress, sizeof(serverAddress)) < 0) {
        perror("connect() failed");
        close(clientSocket);
        return -1;
    }

    // Receive the uptime data from our server
    memset(buffer, 0, sizeof(buffer));
    int bytesReceived = recv(clientSocket, buffer, BUFFER_SIZE - 1, 0);
    if (bytesReceived < 0) {
        perror("recv() failed");
        close(clientSocket);
        return -1;
    }

    // Print: server_ip: uptime output
    printf("%s: %s\n", argv[1], buffer);

    close(clientSocket);
    return 0;
}