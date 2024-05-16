# Wireguard via ssh interface

## Installation:

### Install git and clone this repo:

`sudo apt install git`

`git clone git clone https://github.com/volatilization/wireguard-conf.git`

### Install all dependencies:

`sudo apt install wireguard qrencode curl`

`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`

`exec zsh` or `exec bash`

`nvm install 21`

`sudo ln -s <whereis node> /usr/bin/node`

## Usage:

### Setup Wireguard configuration:

`sudo node wireguard-conf/setUp.js --wg-conf-name=wg0 --wg-conf-dir=/etc/wireguard --wg-port=51800 --wg-admin=CURRENT_USER`

### Add new user:

`node wireguard-conf/addUser.js --wg-conf-name=wg0 --wg-conf-dir=/etc/wireguard --user-conf-name=ADD_USER_NAME`
