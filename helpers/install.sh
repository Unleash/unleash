#!/usr/bin/env bash

set -e

echo ""
sudo apt-get install unzip

curl -L -O https://dl.bintray.com/mitchellh/consul/0.5.2_linux_amd64.zip

unzip 0.5.2_linux_amd64.zip -d /usr/bin

consul agent -data-dir=/tmp/consul -dc=oslo0 &
consul join dev-mod2.finntech.no
consul members