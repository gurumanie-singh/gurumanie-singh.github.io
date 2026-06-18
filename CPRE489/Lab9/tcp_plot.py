import re
import matplotlib.pyplot as plt
from collections import defaultdict

flows = defaultdict(lambda: {'time': [], 'cwnd': [], 'ssthresh': []})

with open('tcpprobe.dat', 'r') as f:
    for line in f:
        if 'tcp_probe' not in line:
            continue

        time_match  = re.search(r'\s(\d+\.\d+): tcp_probe', line)
        src_match   = re.search(r'src=[\d.]+:(\d+)', line)
        cwnd_match  = re.search(r'snd_cwnd=(\d+)', line)
        sst_match   = re.search(r'ssthresh=(\d+)', line)

        if not (time_match and src_match and cwnd_match and sst_match):
            continue

        t        = float(time_match.group(1))
        sport    = src_match.group(1)
        cwnd     = int(cwnd_match.group(1))
        ssthresh = int(sst_match.group(1))

        flows[sport]['time'].append(t)
        flows[sport]['cwnd'].append(cwnd)
        flows[sport]['ssthresh'].append(ssthresh)

print(f"Found {len(flows)} flows: {list(flows.keys())}")

# Normalize time to 0
for key in flows:
    t0 = flows[key]['time'][0]
    flows[key]['time'] = [t - t0 for t in flows[key]['time']]

Y_MAX = 50

fig, axes = plt.subplots(len(flows), 1, figsize=(12, 4 * len(flows)), sharex=True)
if len(flows) == 1:
    axes = [axes]

for ax, (sport, data) in zip(axes, flows.items()):
    time     = data['time']
    cwnd     = data['cwnd']
    ssthresh = [min(s, Y_MAX) for s in data['ssthresh']]

    ax.plot(time, cwnd,     label='cwnd',     linewidth=1.2)
    ax.plot(time, ssthresh, label='ssthresh', linewidth=1.2, linestyle='--')

    ax.set_title(f'src port {sport}')
    ax.set_ylabel('CWND (in MSS)')
    ax.set_ylim(0, Y_MAX)
    ax.legend()
    ax.grid(True, alpha=0.3)

axes[-1].set_xlabel('Time (s)')
fig.suptitle('TCP Congestion Window & Slow-Start Threshold per Flow', fontsize=13)
plt.tight_layout()
plt.savefig('tcp_cwnd_plot.png', dpi=150)
plt.show()
print("Saved tcp_cwnd_plot.png")