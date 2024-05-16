const {execSync} = require('node:child_process');
const {readFileSync, writeFileSync, mkdirSync} = require('node:fs');


const wgConfDir = extractFromArgsOrDefault('wg-conf-dir', '/etc/wireguard');
const wgConfName = extractFromArgsOrDefault('wg-conf-name', 'wg0');
const userConfName = extractFromArgs('user-conf-name');

const keys = generateKeys(userConfName);
const currentPeers = updateWgConf(wgConfDir, wgConfName, keys.public);
generateUserConf(userConfName, keys.private, currentPeers);


function generateKeys(userName) {
    const privateKeyLocation = `./users/${userName}/privatekey`;
    const publicKeyLocation = `./users/${userName}/publickey`;

    mkdirSync(`./users/${userName}`);
    execSync(`wg genkey | tee ${privateKeyLocation} | wg pubkey | tee ${publicKeyLocation}`);

    const privateKey = readFileSync(privateKeyLocation, 'utf8').split('\n')[0];
    const publicKey = readFileSync(publicKeyLocation, 'utf8').split('\n')[0];
    execSync(`chmod 444 ${privateKeyLocation}`);
    execSync(`chmod 444 ${publicKeyLocation}`);

    return {private: privateKey, public: publicKey};
}

function updateWgConf(confDir, confName, userPublicKey) {
    const currentWgConf = readFileSync(`${confDir}/${confName}.conf`, 'utf8');
    const currentPeers = currentWgConf.split('[Peer]').length - 1;

    writeFileSync(`${confDir}/${confName}.conf`,

`${currentWgConf}

[Peer]
PublicKey = ${userPublicKey}
AllowedIPs = 10.0.0.${currentPeers + 10}/32`

    );

    return currentPeers;
}

function generateUserConf(userConfName, userPrivateKey, currentPeers) {
    const userConfTemplate = readFileSync('./users/user.conf.template', 'utf8');

    writeFileSync(`./users/${userConfName}/vpn.conf`,

`[Interface]
PrivateKey = ${userPrivateKey}
Address = 10.0.0.${currentPeers + 10}/32
DNS = 8.8.8.8

${userConfTemplate}`
    );

    console.log(execSync(`qrencode -t ansiutf8 < ./users/${userConfName}/vpn.conf`).toString());
}

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
