import socket
import struct
import sys
import thread
from sys import stdin

address = ''
SEND_PORT = 59810
LISTEN_PORT = 59811

# set up the write socket
wsocket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)

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
        elif (line == 'query'):
            wsocket.sendto('{"action": "query"}', ('255.255.255.255', SEND_PORT))

# listens for responses from other multicast clients on a separate thread
def listen(threadName):
    print("Listener started.")

    while True:
        print("Waiting for multicast message.")
        data, sender = wsocket.recvfrom(1024)
        while data[-1:] == '\0': data = data[:-1] # Strip trailing \0's
        print (str(sender) + '  ' + repr(data))

def sendAction(action):
    if not action:
        action = 'play_pause"}'

    print("Sending action %s" % (action))

    wsocket.sendto('{"action": "' + action + '"}', (address, SEND_PORT))

if __name__ == '__main__':
    main()
