const { ICommand } = require('@libs/builders/command/command.builder')
const { Client } = require('youtubei')

const youtube = new Client()

/**
 * @type { ICommand }
 */
module.exports = {
    aliases: ['yts'],
    category: 'youtube',
    description: 'Youtube search.',
    waitMessage: true,
    minArgs: 1,
    expectedArgs: '<consulta>',
    example: '{prefix}{command} Plutão vmz',
    callback: async ({ msg, client, fullArgs }) => {
        youtube.search(fullArgs, { type: 'video' }).then((res) => {
            const result = res.map((v) => {
                return {
                    id: v.id,
                    title: v['title'],
                    duration: v['duration'],
                    views: v['viewCount'],
                    thumbnail: v.thumbnails[0].url.split('?')[0],
                }
            })
            let text = `Youtube Search\n~> Pesquisa : ${fullArgs}\n\`\`\``
            text += result
                .slice(0, 5)
                .map((x) => {
                    return `\n📙 Título : ${x.title}\n👀 Views: ${x.views?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\n📎 Url: https://www.youtube.com/watch?v=${x.id}`
                })
                .join('\n\n=====================\n')
            text += '```'
            return client.sendMessage(msg.from, { image: { url: result[0].thumbnail }, caption: text })
        })
    },
}
