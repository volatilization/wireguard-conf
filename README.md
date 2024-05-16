before setup install:

`sudo apt install wireguard qrencode git nodejs npm`

run once
`sudo node setUp.js --wg-conf-name=wg0 --wg-conf-dir=/etc/wireguard --wg-port=51800 --wg-admin=$USER`

run evry time when add user. result - qr code 
`node addUser.js --wg-conf-name=wg0 --wg-conf-dir=/etc/wireguard --user-conf-name=$ADD_USER_NAME`
