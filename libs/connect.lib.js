const { default: WASocket, fetchLatestBaileysVersion, useMultiFileAuthState, DisconnectReason } = require('@adiwajshing/baileys')
const { Utility } = require('./utils/utils/utility.util')
const { logger } = require('./utils/logger/logger.util')
const { sessionName } = require('@config')
const { messageHandler } = require('./handlers')
const { Boom } = require('@hapi/boom')
const { existsSync } = require('fs')
const store = require('@store')
const chalk = require('chalk')
const Pino = require('pino')

existsSync('./store/baileys_store.json') && store.readFromFile('./store/baileys_store.json')
setInterval(() => {
    store.writeToFile('./store/baileys_store.json')
}, 60_000)

const utility = new Utility()

const connect = async () => {
    const { state, saveCreds } = await useMultiFileAuthState(`./session/${sessionName}-session`)
    const { version, isLatest } = await fetchLatestBaileysVersion()

    const client = WASocket({
        printQRInTerminal: true,
        auth: state,
        logger: Pino({ level: 'silent' }),
        browser: ['Asag', 'Safari', '1.0'],
        version,
    })

    store.bind(client.ev)

    client.ev.on('chats.set', () => {
        logger.store(`Got ${store.chats.all().length} chats`)
    })

    client.ev.on('contacts.set', () => {
        logger.store(`Pegou ${Object.values(store.contacts).length} Contatos`)
    })

    client.ev.on('creds.update', saveCreds)
    client.ev.on('connection.update', async (up) => {
        const { lastDisconnect, connection, qr } = up

        if (qr) {
            logger.stats('Por favor, escaneie o QR Code para conectar')
        }

        if (connection) {
            logger.stats('Status da conexão: ', connection)
        }

        if (connection === 'close') {
            let reason = new Boom(lastDisconnect.error).output.statusCode
            if (reason === DisconnectReason.badSession) {
                logger.error(`Arquivo de sessão inválido, exclua ./session/${sessionName}-sessão e digitalizar novamente`)
                client.logout()
            } else if (reason === DisconnectReason.connectionClosed) {
                logger.error('Conexão fechada, reconectando....')
                connect()
            } else if (reason === DisconnectReason.connectionLost) {
                logger.error('Conexão perdida do servidor, reconectando...')
                connect()
            } else if (reason === DisconnectReason.connectionReplaced) {
                logger.error('Conexão substituída, outra nova sessão aberta, feche a sessão atual primeiro')
                client.logout()
            } else if (reason === DisconnectReason.loggedOut) {
                logger.error(`Dispositivo desconectado, exclua ./session/${sessionName}-session e digitalizar novamente.`)
                client.logout()
            } else if (reason === DisconnectReason.restartRequired) {
                logger.error('Reinicialização necessária, reinicie...')
                connect()
            } else if (reason === DisconnectReason.timedOut) {
                logger.error('Tempo limite de conexão esgotado, reconectando...')
                connect()
            } else {
                client.end(new Error(`Razão de Desconexão Desconhecida: ${reason}|${lastDisconnect.error}`))
            }
        }
    })

    // messages.upsert
    client.ev.on('messages.upsert', ({ messages, type }) => {
        if (type !== 'notify') return
        messageHandler(client, { messages, type })
    })
}

module.exports = {
    connect,
}
