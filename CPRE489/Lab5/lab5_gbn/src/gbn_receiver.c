#include "crc.h"
#include "pkt_utils.h"
#include <arpa/inet.h>
#include <stdbool.h>
#include <stdio.h>
#include <sys/socket.h>

#define NUM_EXPECTED_PACKETS 13

/* wrapping common, correlated variables in a struct can help
 * tidy our function signatures and make things concise */
typedef struct {
	int sockfd;
	struct sockaddr_in *client_addr;
	socklen_t addr_len;
} gbn_context_t;

/* Small, verbosely-named functions can help the main structure of our code
 * read cleanly. It's must easier to read gbn_receive with aptly-named helpers. */
static bool is_packet_valid(packet_t *pkt);
static void send_response(gbn_context_t *ctx, packet_t *response);
static void handle_corrupted(gbn_context_t *ctx, packet_t *pkt, uint8_t expected);
static void handle_in_order(gbn_context_t *ctx, packet_t *pkt, uint8_t *expected);
static void handle_out_of_order(gbn_context_t *ctx, packet_t *pkt, uint8_t expected);

void gbn_receive(int sockfd) {
	struct sockaddr_in client_addr;
	socklen_t addr_len = sizeof(client_addr);
	gbn_context_t ctx = {sockfd, &client_addr, addr_len};
	packet_t read_packet;
	uint8_t expected = 0;
	int read_size;

	printf("\n---------Beginning subroutine---------\n");

	while (expected < NUM_EXPECTED_PACKETS) {
		read_size = recvfrom(ctx.sockfd, read_packet.bytes, PKT_SIZE, 0, (struct sockaddr *)ctx.client_addr, &ctx.addr_len);
		if (read_size < 0) {
			perror("recv failed");
			return;
		}

		if (is_packet_valid(&read_packet)) {
			if (read_packet.sequence_number == expected) {
				handle_in_order(&ctx, &read_packet, &expected);
			} else {
				handle_out_of_order(&ctx, &read_packet, expected);
			}
		} else {
			handle_corrupted(&ctx, &read_packet, expected);
		}
	}

	printf("\n---------Finished subroutine---------\n");
}

static bool is_packet_valid(packet_t *packet) {
	uint16_t expected_crc = crc_calculate(packet->bytes, PKT_SIZE - 2);
	return ntohs(packet->crc_sum) == expected_crc;
}

static void send_response(gbn_context_t *ctx, packet_t *response) {
	printf("\t-> Sending: ");
	pkt_print(response);
	if (sendto(ctx->sockfd, (char *)response, sizeof(*response), 0,
			   (struct sockaddr *)ctx->client_addr, ctx->addr_len) < 0) {
		perror("Send failed");
	}
}

static void handle_corrupted(gbn_context_t *ctx, packet_t *pkt, uint8_t expected) {
	pkt_print(pkt);
	uint16_t expected_crc = crc_calculate(pkt->bytes, PKT_SIZE - 2);
	printf("\t-> Expected CRC: %x, Received CRC: %x\n", expected_crc, pkt->crc_sum);

	packet_t nak;
	char pkt_data[] = "\0\0";
	pkt_build(&nak, PKT_TYPE_NAK, pkt_data, expected);
	send_response(ctx, &nak);
}

static void handle_in_order(gbn_context_t *ctx, packet_t *pkt, uint8_t *expected) {
	pkt_print(pkt);

	packet_t ack;
	char pkt_data[PKT_DATA_SIZE] = {'\0', '\0'};
	pkt_build(&ack, PKT_TYPE_ACK, pkt_data, ++(*expected));
	send_response(ctx, &ack);
}

static void handle_out_of_order(gbn_context_t *ctx, packet_t *pkt, uint8_t expected) {
    pkt_print(pkt);
	printf("\t-> Out of order, expected %d\n", expected);
	packet_t ack;
	char pkt_data[PKT_DATA_SIZE] = {'\0', '\0'};
	pkt_build(&ack, PKT_TYPE_ACK, pkt_data, expected);
	send_response(ctx, &ack);
}
