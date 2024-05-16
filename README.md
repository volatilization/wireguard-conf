# Wireguard via ssh interface

## Installation:

### Install git and clone this repo:

``` bash
sudo apt install git &&
git clone git clone https://github.com/volatilization/wireguard-conf.git
```

### Install all dependencies:

``` bash
sudo apt install wireguard qrencode curl &&
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash &&
source .zshrc &&
nvm install 21 &&
sudo ln -s <whereis node> /usr/bin/node
```

## Usage:

### Setup Wireguard configuration:

``` bash
sudo node wireguard-conf/setUp.js --wg-conf-name=wg0 --wg-conf-dir=/etc/wireguard --wg-port=51800 --wg-admin=CURRENT_USER
```

### Add new user:

``` bash
node wireguard-conf/addUser.js --wg-conf-name=wg0 --wg-conf-dir=/etc/wireguard --user-conf-name=NEW_USER_NAME
```

### Tips

Add this to .zshrc

``` bash
alias wg-setup="cd ~ && sudo node sudo node wireguard-conf/setUp.js --wg-admin=CURRENT_USER"

wg-add-user() {
   cd ~ && node wireguard-conf/addUser.js --user-conf-name=$1 && sudo systemctl restart wg-quick@wg0 
}
```
then use `wg-setup` and `wg-add-user NEW_USER_NAME`
