import socket
import struct

MCAST_GRP = '224.1.1.1'
MCAST_PORT = 5010
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 32)
sock.sendto('Hello World!', (MCAST_GRP, MCAST_PORT))

print("TEST")
