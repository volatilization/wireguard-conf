const {writeFileSync, readFileSync, mkdirSync} = require('node:fs');
const {execSync} = require('node:child_process');


const wgConfDir = extractFromArgsOrDefault('wg-conf-dir', '/etc/wireguard');
const wgConfName = extractFromArgsOrDefault('wg-conf-name', 'wg0');
const wgPort = extractFromArgsOrDefault('wg-port', '51800');
const currentServer = extractFromArgsOrDefault('server', extractCurrentServerIP());

const keys = generateKeys(wgConfDir, wgConfName);
setUpWgConf(wgConfDir, wgConfName, keys.private, wgPort)
setUpUserConfTemplate(keys.public, currentServer, wgPort);

const wgAdmin = extractFromArgsOrDefault('wg-admin', 'root');
setUpConfOwner(wgConfDir, wgConfName, wgAdmin);

execSync(`systemctl enable --now wg-quick@${wgConfName}`);


function extractFromArgs(argName) {
    const arg = process.argv.find(arg => arg.startsWith(`--${argName}`));

    if (arg == null || arg.split('=')[1] === '') {
        throw new Error(`--${argName} arg is necessary`);
    }

    if (arg.split('=')[1] === '') {
        throw new Error(`--${argName} arg сan\'t be empty`);
    }

    return arg.split('=')[1];
}

function extractFromArgsOrDefault(argName, defaultValue) {
    try {
        return extractFromArgs(argName);

    } catch (e) {
        return defaultValue;
    }
}

function extractCurrentServerIP() {
    const ipIncludesStr = execSync('ip address show').toString()
        .split('\n')
        .find(str => str.includes('inet')
            && str.includes('scope global'));

    if (ipIncludesStr == null) {
        throw new Error('cant extract ip from ip address show');
    }

    return ipIncludesStr.split('inet')[1].split('scope')[0].trim().split('/')[0];
}

function generateKeys(confDir, confName) {
    const privateKeyLocation = `${confDir}/${confName}_privatekey`;
    const publicKeyLocation = `${confDir}/${confName}_publickey`;

    checkFilesExistence([privateKeyLocation, publicKeyLocation]);

    mkdirSafe(confDir);
    execSync(`wg genkey | tee ${privateKeyLocation} | wg pubkey | tee ${publicKeyLocation}`);
    execSync(`wg genkey | tee ${privateKeyLocation} | wg pubkey | tee ${publicKeyLocation}`);
    execSync(`chmod 444 ${privateKeyLocation}`);
    execSync(`chmod 444 ${publicKeyLocation}`);

    const privateKey = readFileSync(privateKeyLocation, 'utf8').split('\n')[0];
    const publicKey = readFileSync(publicKeyLocation, 'utf8').split('\n')[0];

    return {private: privateKey, public: publicKey};
}

function setUpWgConf(confDir, confName, privateKey, port) {
    checkFilesExistence([`${confDir}/${confName}.conf`]);

    mkdirSafe(confDir);
    writeFileSync(`${confDir}/${confName}.conf`,

`[Interface]
Address = 10.0.0.1/24
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
ListenPort = ${port}
PrivateKey = ${privateKey}`

    );
}

function setUpUserConfTemplate(publicKey, server, port) {
    checkFilesExistence(['./users/user.conf.template']);

    mkdirSafe('./users');
    writeFileSync('./users/user.conf.template',

`[Peer]
PublicKey = ${publicKey}
Endpoint = ${server}:${port}
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 20`

    );
}

function setUpConfOwner(confDir, confName, owner) {
    if (owner === 'root') {
        return;
    }

    execSync(`chown -R ${owner}:${owner} ${confDir}`);
    execSync(`chown -R ${owner}:${owner} ./users`);
}

function checkFilesExistence(fileNames) {
    fileNames.forEach(fileName => {
        try {
            readFileSync(fileName);
            console.log(`${fileName} already exist`);
            throw new Error(`${fileName}  already exist`);

        } catch (e) {
            if (e.code === 'ENOENT') {
                return;
            }

            throw e;
        }
    })
}

function mkdirSafe(dirName) {
    try {
        mkdirSync(dirName, {recursive: true});
        console.log(`dir ${dirName} created`);

    } catch (e) {
        if (e.code !== 'EEXIST') {
            throw e;
        }

        console.log(`dir ${dirName} already exist`);
    }
}