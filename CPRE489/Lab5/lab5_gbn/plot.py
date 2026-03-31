import statistics
import matplotlib.pyplot as plt

# BER values to test
ber_values = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05]

results = {
    0.001: [19, 19, 19, 19, 19],
    0.002: [23, 23, 23, 23, 23],
    0.005: [63, 63, 63, 63, 63],
    0.01:  [107, 107, 107, 107, 107],
    0.02:  [538, 538, 538, 538, 538],
    0.05:  [6653, 6653, 6653, 6653, 6653],
}

medians = []
for ber in ber_values:
    attempts_per_packet = [total / 13 for total in results[ber]]
    medians.append(statistics.median(attempts_per_packet))

plt.plot(ber_values, medians, marker='o')
plt.xlabel("BER Value")
plt.ylabel("Median # of Transmission Attempts per Data Packet")
plt.title("Transmission Attempts vs BER plot")
plt.grid(True)
plt.savefig("ber_plot.png")
plt.show()