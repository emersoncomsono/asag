const { youtube } = require('@libs/utils/scrapper/download/youtube')
const { ICommand } = require('@libs/builders/command/command.builder')

/**
 * @type { ICommand }
 */
module.exports = {
    aliases: ['yta', 'ytaudio'],
    category: 'youtube',
    description: 'Baixador de áudio do Youtube.',
    waitMessage: true,
    minArgs: 1,
    expectedArgs: '<link>',
    example: '{prefix}{command} https://youtu.be/Sh5QzCif_4Q',
    callback: async ({ msg, args }) => {
        const result = await youtube(args[0], 'mp3')
        await msg.replyImage({ url: result.thumbnail }, `${result.title} - ${result.size}`)
        await msg.replyAudio({ url: result.link })
    },
}
