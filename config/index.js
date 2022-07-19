const config = require('../config.json')
const dotenv = require('dotenv')
const path = require('path')
dotenv.config()

module.exports = {
    rootPath: path.resolve(__dirname, '..'), // Ignore this

    botName: process.env.BOT_NAME || config.botName,

    limit: process.env.LIMIT || config.limit,
    timezone: process.env.TIMEZONE || config.timezone,

    ownerName: process.env.OWNER_NAME || config.ownerName,
    ownerNumber: process.env.OWNER_NUMBER?.split(',') || config.ownerNumber,

    sessionName: process.env.SESSION_NAME || config.sessionName,

    apikey: process.env.APIKEY || config.apikey,
}
