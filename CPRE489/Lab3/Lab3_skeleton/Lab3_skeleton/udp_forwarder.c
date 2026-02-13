/* udp_forwarder.c
 *
 * Author: Gurumanie Singh Dhiman
 * Description: Forwards UDP packets from a source to a destination with packet loss simulation.
 *
 * Usage:
 *   Compile the program:
 *     make
 *   Run it:
 *     ./udp_forwarder <SERVER_IP> <SERVER_PORT> <DESTINATION_IP> <DESTINATION_PORT> <LOSS_RATE>
 *
 *   Loss rate is the number of packets out of 1000 that are dropped.
 *   Example: ./udp_forwarder 127.0.0.1 5000 127.0.0.1 5001 50
 *            This drops 50/1000 packets (5% loss rate)
 *
 * Tips:
 *   - Check the man pages for any functions you're unsure of. Parameters,
 *     return values, and sometimes even examples are listed!
 *     Example: man socket, man bind, man recvfrom, man sendto
 *
 *   - Check for errors on ALL system calls (socket, bind, recvfrom, sendto)
 *
 *   - Abstract logically separate blocks into separate functions!
 *
 *   - Use rand() % 1000 to generate random numbers between 0-999 for loss simulation
 */

#include <stdio.h>       // For printf, fprintf, perror
#include <stdlib.h>      // For atoi, rand, srand, exit, EXIT_FAILURE
#include <string.h>      // For memset, strcmp
#include <time.h>        // For time (seeding random number generator)
#include <sys/socket.h>  // For socket, bind, sendto, recvfrom
#include <arpa/inet.h>   // For inet_addr, htons, sockaddr_in
#include <unistd.h>      // For close
#define BUFFER_SIZE 2048 // For BUFFER initialization
/* main
 * The main entry point of your program
 *
 * Expected command line arguments:
 *   argv[1] - SERVER_IP: IP address to bind/listen on
 *   argv[2] - SERVER_PORT: Port to bind/listen on
 *   argv[3] - DESTINATION_IP: IP address to forward packets to
 *   argv[4] - DESTINATION_PORT: Port to forward packets to
 *   argv[5] - LOSS_RATE: Number of packets out of 1000 to drop
 */
int main(int argc, char **argv)
{
    // Check if correct number of arguments provided (argc should be 6)
    if (argc != 6) {
        fprintf(stderr, "Usage: %s <SERVER_IP> <SERVER_PORT> <DESTINATION_IP> <DESTINATION_PORT> <LOSS_RATE>\n", argv[0]);
        return EXIT_FAILURE;
    }

    // Parse command line arguments
    // Hint: Use atoi() to convert string to integer for ports and loss rate
    char *serverIP = argv[1];
    int serverPort = atoi(argv[2]);
    char *destinationIP = argv[3];
    int destinationPort = atoi(argv[4]);
    int lossRate = atoi(argv[5]);

    // Seed random number generator
    // Hint: srand(time(NULL));
    srand(time(NULL));

    // Create UDP socket
    // Hint: socket(AF_INET, SOCK_DGRAM, 0)
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        perror("the socket() failed...");
        return EXIT_FAILURE;
    }

    // Set up server address structure to bind to
    // Hint: Use struct sockaddr_in, inet_addr(), htons()
    struct sockaddr_in serverAddress;
    memset(&serverAddress, 0, sizeof(serverAddress));
    serverAddress.sin_family = AF_INET;
    serverAddress.sin_port = htons(serverPort);
    serverAddress.sin_addr.s_addr = inet_addr(serverIP);

    // Bind socket to server IP and port
    // Hint: bind(sock_fd, ...)
    if (bind(sockfd, (struct sockaddr *)&serverAddress, sizeof(serverAddress)) < 0) {
        perror("the bind() failed...");
        close(sockfd);
        return EXIT_FAILURE;
    }

    // Set up destination address structure for forwarding
    // Hint: Use struct sockaddr_in, inet_addr(), htons()
    struct sockaddr_in destinationAddress;
    memset(&destinationAddress, 0, sizeof(destinationAddress));
    destinationAddress.sin_family = AF_INET;
    destinationAddress.sin_port = htons(destinationPort);
    destinationAddress.sin_addr.s_addr = inet_addr(destinationIP);

    // Main packet forwarding loop
    // Loop forever:
    //   1. Receive packet using recvfrom()
    //   2. Generate random number (0-999)
    //   3. If random number < loss_rate: drop packet (do nothing)
    //   4. Else: forward packet using sendto() to destination
    while (1) {
        // Buffer for received packets
        char buffer[BUFFER_SIZE];
        struct sockaddr_in sourceAddress;
        socklen_t sourceAddressLength = sizeof(sourceAddress);

        // Receive packet from source
        int bytesReceived = recvfrom(sockfd, buffer, BUFFER_SIZE, 0, (struct sockaddr *)&sourceAddress, &sourceAddressLength);
        if (bytesReceived < 0) {
            perror("the recvfrom() failed...");
            continue;
        }

        // Simulate packet loss: generate random number 0-999
        int randNum = rand() % 1000;
        
        // Drop packet if random number is less than loss rate
        if (randNum < lossRate) {
            // Packet is dropped so we do nothing
            continue;
        }

        // Forward packet to the destination
        int bytesSent = sendto(sockfd, buffer, bytesReceived, 0, (struct sockaddr *)&destinationAddress, sizeof(destinationAddress));
        if (bytesSent < 0) {
            perror("the sendto() failed...");
        }
    }
    // Clean up
    // Hint: close(sock_fd)
    close(sockfd);

    // Good luck! Let your TA know if you have any questions.

    return 0;
}
