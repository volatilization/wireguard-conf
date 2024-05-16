# Wireguard via ssh interface

## Installation:

### Install git and clone this repo:

``` bash
sudo apt install git &&
git clone https://github.com/volatilization/wireguard-conf.git
```

### Install all dependencies:

``` bash
sudo apt install zsh curl wireguard qrencode &&
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" &&
chsh -s /usr/bin/zsh &&
exec zsh &&
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
alias wg-setup="echo PASSWORD | sudo -S node ~/wireguard-conf/setUp.js --wg-admin=CURRENT_USER"

wg-add-user() {
   node ~/wireguard-conf/addUser.js --user-conf-name=$1 && echo PASSWORD | sudo -S systemctl restart wg-quick@wg0 
}
```
then use `wg-setup` and `wg-add-user NEW_USER_NAME`
