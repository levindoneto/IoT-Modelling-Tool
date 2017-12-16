import SimpleHTTPServer
import SocketServer

PORT = 8080
Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
httpd = SocketServer.TCPServer(('', PORT), Handler)
print 'Server running at the port: ', PORT
httpd.serve_forever()