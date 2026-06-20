#!/usr/bin/env python3
"""
Simple static file server with a `/__reload` endpoint that returns the
latest modification timestamp for files under the served directory.

Run: python devserver.py 5500 --directory "d:/work/business/portfolio"
"""
from http.server import HTTPServer, SimpleHTTPRequestHandler
import argparse
import os
import time


def get_latest_mtime(path):
    latest = 0
    for root, dirs, files in os.walk(path):
        # skip .git and __pycache__
        if '.git' in root or '__pycache__' in root:
            continue
        for f in files:
            try:
                p = os.path.join(root, f)
                m = os.path.getmtime(p)
                if m > latest:
                    latest = m
            except Exception:
                continue
    return int(latest)


class ReloadHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/__reload'):
            ts = str(get_latest_mtime(os.getcwd()))
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()
            self.wfile.write(ts.encode('utf-8'))
            return
        return super().do_GET()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('port', nargs='?', type=int, default=5500)
    parser.add_argument('--directory', '-d', default='.')
    args = parser.parse_args()

    os.chdir(args.directory)
    addr = ('0.0.0.0', args.port)
    httpd = HTTPServer(addr, ReloadHandler)
    print(f"Serving {os.getcwd()} on http://127.0.0.1:{args.port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('Stopping server')


if __name__ == '__main__':
    main()
