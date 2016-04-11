import socket
import struct
import sys
import thread
from sys import stdin

MCAST_GRP = '224.1.1.1'
MCAST_PORT = 5011

# set up the write socket
wsocket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
wsocket.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 32)

def main():
    # start the listen thread
    thread.start_new_thread(listen, ('Thread-1',))

    # wait for input from the user
    while True:
        line = stdin.readline()

        print("Input: %s" % (line))

        # remove the last character (\n)
        line = line[:-1]

        if (line == 'quit'):
            break
        elif (line.startswith('send')):
            sendAction(line.replace('send', '').strip())

# listens for responses from other multicast clients on a separate thread
def listen(threadName):
    server_address = ('', MCAST_PORT)

    # Create the socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # Bind to the server address
    sock.bind(server_address)

    group = socket.inet_aton(MCAST_GRP)
    mreq = struct.pack('4sL', group, socket.INADDR_ANY)
    sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

    print("Listener started.")

    while True:
        print("Waiting for multicast message.")
        data, sender = sock.recvfrom(1024)
        while data[-1:] == '\0': data = data[:-1] # Strip trailing \0's
        print (str(sender) + '  ' + repr(data))

def sendAction(action):
    if not action:
        action = 'play_pause"}'

    print("Sending action %s" % (action))

    wsocket.sendto('{"action": "' + action + '"}', (MCAST_GRP, MCAST_PORT))

if __name__ == '__main__':
    main()
