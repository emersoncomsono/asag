const { youtube } = require('@libs/utils/scrapper/download/youtube')
const { ICommand } = require('@libs/builders/command/command.builder')

/**
 * @type { ICommand }
 */
module.exports = {
    aliases: ['ytv', 'ytvideo'],
    category: 'youtube',
    description: 'Baixa vídeos do Youtube.',
    waitMessage: true,
    minArgs: 1,
    expectedArgs: '<link>',
    example: '{prefix}{command} https://youtu.be/Sh5QzCif_4Q',
    callback: async ({ msg, args }) => {
        const result = await youtube(args[0], 'mp4')
        await msg.replyImage({ url: result.thumbnail }, `${result.title} - ${result.size}`)
        await msg.replyVideo({ url: result.link })
    },
}
