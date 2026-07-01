# CPR E 4890 Lab 3 Skeleton Code

This folder contains a makefile and a template C file. You can compile your
program using the makefile:

```bash
make
```

and run it with the format:

```bash
./udp_forwarder <SERVER_IP> <SERVER_PORT> <DESTINATION_IP> <DESTINATION_PORT> <LOSS_RATE>
```

It is up to you to implement the behavior defined by the lab manual (including handling arguments).

By default, almost all errors and warnings will prevent your program from
compiling. It is generally a good idea to leave this on. However, if you want to
live dangerously, you may disable this by removing the `Wfatal-errors` compiler
flag from the makefile.

## Testing Your Program

You can use VLC media player to test your program as follows.

To generate a source video stream directed towards `SERVER_IP:SERVER_PORT`:

```bash
cvlc --repeat test.mp4 --sout '#standard{access=udp,mux=ts,dst=SERVER_IP:SERVER_PORT}'
```

To play your video on the receiving address, `DEST_IP:DEST_PORT`:

```bash
vlc -vvv udp://@DEST_IP:DEST_PORT
```

**IMPORTANT:** `SERVER_PORT` and `DEST_PORT` must be different! Your program will
receive on `SERVER_PORT` and send to `DEST_PORT`. If they're the same, the destination VLC will bind to the port before your forwarder can start, causing your program to fail with a "bind: Address already in use" error.

## Example Testing Workflow

For testing in the lab (using localhost):

**Terminal 1 - Start the destination VLC player:**
```bash
vlc -vvv udp://@127.0.0.1:5001
```

**Terminal 2 - Start your UDP forwarder:**
```bash
./udp_forwarder 127.0.0.1 5000 127.0.0.1 5001 50
```
This forwards packets from port 5000 to 5001 with 5% packet loss (50/1000).

**Terminal 3 - Start the source VLC stream:**
```bash
cvlc --repeat test.mp4 --sout '#standard{access=udp,mux=ts,dst=127.0.0.1:5000}'
```

You should now see the video playing in Terminal 1 with some packet loss causing occasional glitches!

## Loss Rate Examples

- `0` - No loss (0%)
- `10` - 1% loss (10 out of 1000 packets dropped)
- `50` - 5% loss (50 out of 1000 packets dropped)
- `100` - 10% loss
- `500` - 50% loss (very noticeable degradation)

## Troubleshooting

- **"bind: Address already in use"** - Another program (possibly VLC or a previous instance of your forwarder) is using the port. Use a different port or kill the other process.
- **No video appears** - Check that all three components (source VLC, forwarder, destination VLC) are running and using the correct ports.
- **Video freezes** - Loss rate may be too high. Try a lower value.