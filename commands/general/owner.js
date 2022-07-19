const { ICommand } = require('@libs/builders/command/command.builder')
const config = require('@config')

/**
 * @type { ICommand }
 */
module.exports = {
    category: 'Sobre',
    description: 'Conversar com o proprietário do bot.',
    callback: async ({ msg, client }) => {
        const vcard =
            'BEGIN:VCARD\n' + // metadata of the contact card
            'VERSION:3.0\n' +
            `FN:${config.ownerName}\n` + // full name
            `ORG:Owner ${config.botName} Bot;\n` + // the organization of the contact
            `TEL;type=CELL;type=VOICE;waid=${config.ownerNumber[0]}:+${config.ownerNumber[0]}\n` + // WhatsApp ID + phone number
            'END:VCARD'
        return client.sendMessage(msg.from, {
            contacts: {
                displayName: config.ownerName,
                contacts: [{ vcard }],
            },
        })
    },
}
