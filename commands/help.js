const { ICommand } = require('@libs/builders/command/command.builder')
const { listCommands, commands } = require('@libs/constants/command/command.constant')
const { timeFormat } = require('@utils/utils/utils.util')
const moment = require('moment-timezone')
const config = require('@config')

/**
 * @type { ICommand }
 */
module.exports = {
    aliases: ['menu'],
    callback: async ({ msg, client, args, prefix }) => {
        if (args.length > 0) {
            if (args[0] === 'listmenu') {
                var sections = []
                for (var title in listCommands) {
                    sections.push({
                        title: title.toUpperCase(),
                        rows: listCommands[title].map((v) => ({
                            title: v,
                            rowId: `${prefix}help ${v}`,
                            description: commands.get(v).description,
                        })),
                    })
                }

                return client.sendMessage(msg.from, {
                    title: `${config.botName} Menu's`,
                    text: `Para ver como o comando funciona digite ${prefix}help <command>`,
                    footer: `© ${config.botName} Bot`,
                    buttonText: 'Menu',
                    sections,
                })
            }

            /**
             * @type { ICommand }
             */
            let command = commands.get(args[0]) || commands.find((v) => v?.aliases?.includes(args[0]))
            if (command) {
                let text = `*➪ Comando :* ${args[0]}\n`
                text += `*➪ Alias :* ${command?.aliases?.join(', ') || '-'}\n`
                text += `*➪ Categoria :* ${command.category}\n`
                if (command?.groupOnly) {
                    text += `*➪ Somente Grupo :* Yes\n`
                }
                if (command?.adminOnly) {
                    text += `*➪ Somente administrador :* Yes\n`
                }
                if (command?.privateOnly) {
                    text += `*➪ Somente privado :* Yes\n`
                }
                if (command?.premiumOnly) {
                    text += `*➪ Somente Premium :* Yes\n`
                }
                if (command?.ownerOnly) {
                    text += `*➪ Somente proprietário :* Yes\n`
                }
                text += `*➪ Descrição :* ${command.description}\n`
                text += `*➪ Exemplo :* ${command?.example?.format({ prefix, command: args[0] }) || `${prefix}${args[0]}`}`
                return client.sendMessage(msg.from, {
                    text: text.trim(),
                    templateButtons: [
                        {
                            urlButton: {
                                displayText: 'Copiar',
                                url: `https://www.whatsapp.com/otp/copy/${prefix}${args[0]}`,
                            },
                        },
                    ],
                })
            } else {
                return msg.reply(`Command ${args[0]} not found.`)
            }
        }

        var text =
            `Oi ${msg.pushName || `@${msg.senderNumber}`}, Como posso ajudá-lo?\n\n` +
            `―――――――――――――――\n` +
            `🕰️ *Horário do servidor:* ${moment().locale('pt').tz(config.timezone).format('dddd, DD MMMM YYYY HH:mm:ss')}\n` +
            `🗒️ *Comandos totais:* ${commands.size}\n` +
            `🚀 *Uptime:* ${timeFormat(process.uptime())}\n` +
            `❕ *Prefix:* Multi Prefix\n` +
            `―――――――――――――――\n\n`

        return client.sendMessage(msg.from, {
            text,
            footer: `© ${config.botName} Bot`,
            title: `${config.botName} Help`,
            templateButtons: [
                { index: 1, quickReplyButton: { displayText: 'Owner Bot', id: prefix + 'owner' } },
                { index: 2, quickReplyButton: { displayText: 'Menu Completo', id: prefix + 'help listmenu' } },
            ],
            mentions: [msg.sender],
        })
    },
}
