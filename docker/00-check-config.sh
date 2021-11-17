#!/bin/sh

NGINX_HOME=/usr/share/nginx/html

if [ ! -f $NGINX_HOME/config.js ]; then
	echo "error: $NGINX_HOME/config.js not found"
	exit 1
fi
