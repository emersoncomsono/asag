const { ICommand } = require('@libs/builders/command/command.builder')

/**
 * @type { ICommand }
 */
module.exports = {
    category: 'Sobre',
    description: 'Mostre suas estatísticas.',
    callback: async ({ msg, database }) => {
        const user = database.users.findOne(msg.senderNumber)
        return msg.reply(`
Número do usuário : ${user.user_wa_number}
Limite do usuário : ${user.user_limit}
Nível de usuário : Lv. ${user.user_level}
Experiência de usuário : ${user.user_exp} XP
Usuário Premium : ${user.user_premium ? 'Sim' : 'Não'}
Usuário cadastrado : ${user.user_create_at}
`)
    },
}
