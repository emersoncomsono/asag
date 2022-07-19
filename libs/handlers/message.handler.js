const { getContentType, MessageUpdateType, WAMessage, WASocket } = require('@adiwajshing/baileys')
const { commands } = require('@libs/constants/command/command.constant')
const { ICommand } = require('@libs/builders/command/command.builder')
const { serialize } = require('@libs/utils/serialize/serialize.util')
const database = require('@libs/databases')
const config = require('@config')
const chalk = require('chalk')

/**
 *
 * @param { WASocket } client
 * @param { { messages: WAMessage[], type: MessageUpdateType } } param1
 */
module.exports = async (client, { messages, type }) => {
    const message = messages[0]
    if (message.key && message.key.remoteJid === 'status@broadcast') return
    if (!message.message) return

    message.type = getContentType(message.message)
    const body =
        message.message?.conversation ||
        message.message[message.type]?.text ||
        message.message[message.type]?.caption ||
        message.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        message.message?.buttonsResponseMessage?.selectedButtonId ||
        message.message?.templateButtonReplyMessage?.selectedId ||
        null
    const isCommand = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^@*&.+-,©^\/]/.test(body)
    client.readMessages([message.key])
    if (message.type === 'protocolMessage' || message.type === 'senderKeyDistributionMessage' || !message.type) return
    if (!isCommand) return

    const msg = await serialize(message, client)
    if (msg.responseId) {
        msg.body = msg.responseId
    }

    const prefix = isCommand ? msg.body[0] : null
    const args = msg.body?.trim()?.split(/ +/)?.slice(1)
    const command = isCommand ? msg.body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : null
    const fullArgs = msg.body?.replace(command, '')?.slice(1)?.trim() || null

    /**
     * @type { ICommand }
     */
    const getCommand = commands.get(command) || commands.find((v) => v?.aliases && v?.aliases?.includes(command))

    if (getCommand) {
        database.users.insert(msg.senderNumber)
        let user = database.users.findOne(msg.senderNumber)
        database.users.addExp(msg, msg.senderNumber, 100)
        const command_log = [chalk.whiteBright('├'), chalk.keyword('aqua')(`[ ${msg.isGroup ? ' GRUPO ' : 'PRIVADO'} ]`), msg.body.substr(0, 50).replace(/\n/g, ''), chalk.greenBright('from'), chalk.yellow(msg.senderNumber)]
        if (msg.isGroup) {
            command_log.push(chalk.greenBright('Dentro'))
            command_log.push(chalk.yellow(msg.groupMetadata.subject))
        }
        console.log(...command_log)

        if (getCommand.ownerOnly && config.ownerNumber.includes(msg.senderNumber)) {
            return msg.reply('Desculpe, comando apenas para o proprietário.')
        }
        if (getCommand.premiumOnly && !user.user_premium) {
            return msg.reply('Desculpe, comando apenas para usuários premium.')
        }
        if (getCommand.groupOnly && !msg.isGroup) {
            return msg.reply('Desculpe, comando apenas para grupos.')
        }
        if (
            getCommand.groupOnly &&
            getCommand.adminOnly &&
            !msg.groupMetadata.participants
                .filter((v) => v.admin)
                .map((v) => v.id)
                .includes(msg.senderNumber + '@s.whatsapp.net')
        ) {
            return msg.reply('Desculpe, comando apenas para o grupo admin.')
        }
        if (getCommand.privateOnly && msg.isGroup) {
            return msg.reply('Desculpe, comando apenas para bate-papo privado.')
        }

        if (getCommand.minArgs && getCommand.minArgs > args.length) {
            var text = `*O argumento mínimo é ${getCommand.minArgs}*\n`
            if (getCommand.expectedArgs) {
                text += `*Argumento :* ${getCommand.expectedArgs}\n`
                text += `*Uso :* {prefix}{command} {argument}\n`
            }
            if (getCommand.example) {
                text += `*Exemplo :* ${getCommand.example}`
            }
            return msg.reply(text.format({ prefix, command, argument: getCommand.expectedArgs }))
        }

        if (getCommand.waitMessage) {
            if (typeof getCommand.waitMessage === 'string') {
                await msg.reply(getCommand.waitMessage)
            } else {
                await msg.reply('Por favor, espere...')
            }
        }

        return getCommand.callback({ client, message, msg, command, prefix, args, fullArgs, database })
    }
}
