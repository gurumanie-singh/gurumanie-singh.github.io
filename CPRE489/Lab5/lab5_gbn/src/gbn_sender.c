#include "pkt_utils.h"
#include <arpa/inet.h>
#include <stdio.h>
#include <string.h>

/* Sends the 26 bytes of the alphabet over the socket described by sockfd to
 * dest. Also, introduces bit error at the rate of ber. */
void gbn_send_alphabet_to(int sockfd, struct sockaddr_in dest, double ber) {
    printf("\n---------Beginning subroutine---------\n");

    // Build all 13 packets (26 alphabets, 2 per packet)
    packet_t packets[13];
    char alphabet[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (int i = 0; i < 13; i++) {
        char data[PKT_DATA_SIZE] = {alphabet[i * 2], alphabet[i * 2 + 1]};
        pkt_build(&packets[i], PKT_TYPE_DATA, data, i);
        printf("Packet built: ");
        pkt_print(&packets[i]);
    }

    int oldestPacket = 0;   // Oldest unacknowledged packet
    int nextPacket = 0;     // Next packet to send
    int total_sent = 0;

    while (oldestPacket < 13) {
        // Send all the new packets that are within the window size (N = 3)
        while (nextPacket < oldestPacket + 3 && nextPacket < 13) { // Window Size = 3 && < 13 packets
            packet_t send_pkt = packets[nextPacket];
            introduce_bit_error((char *)send_pkt.bytes, PKT_SIZE, ber);
            printf("Sending packet %d: ", nextPacket);
            pkt_print(&send_pkt);
            sendto(sockfd, send_pkt.bytes, PKT_SIZE, 0, (struct sockaddr *)&dest, sizeof(dest));
            nextPacket++;
            total_sent++;
        }

        // Wait for a response
        packet_t response;
        recvfrom(sockfd, response.bytes, PKT_SIZE, 0, NULL, NULL);
        printf("Received response: ");
        pkt_print(&response);

        if (response.type == PKT_TYPE_ACK) { // If we receive ACK
            printf("ACK for packet %d\n", response.sequence_number - 1);
            oldestPacket = response.sequence_number; // cumulative ACK: receiver expects seq = oldestPacket
        } else if (response.type == PKT_TYPE_NAK) { // If we receive NAK, retransmit all packets in the current window
            printf("NAK received, the retransmit window is now from packet %d\n", oldestPacket);
            nextPacket = oldestPacket;
        }
    }
    printf("Total packets sent: %d\n", total_sent);


    // We'll start off with an example of building and sending a single packet of data 0x1234
    /*
    char data[] = {0x12, 0x34};
    packet_t packet;
    pkt_build(&packet, PKT_TYPE_DATA, data, 0);
    printf("Built packet: ");
    pkt_print(&packet);
    */
    
    // Now, let's introduce some bit error into the packet
    /*
    introduce_bit_error((char *)packet.bytes, PKT_SIZE, ber);
    printf("Introduced error, now packet is: ");
    pkt_print(&packet);
    */
    
    // And send it
    /*
    sendto(sockfd, packet.bytes, PKT_SIZE, 0, (struct sockaddr *)&dest, sizeof(dest));
    printf("Sent packet\n");
    */

    // And finally, see what the response is from the server/receiver
    /*
    packet_t response;
    recvfrom(sockfd, response.bytes, PKT_SIZE, 0, NULL, NULL);
    printf("Received response: ");
    pkt_print(&response);
    */
}