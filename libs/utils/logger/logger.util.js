const chalk = require('chalk')

class Logger {
    stats(...args) {
        console.log(chalk.whiteBright('├'), chalk.keyword('aqua')(`[  ESTATÍSTICAS  ]`), ...args)
    }

    private(...args) {
        console.log(chalk.whiteBright('├'), chalk.keyword('aqua')(`[ PRIVADO ]`), ...args)
    }

    group(...args) {
        console.log(chalk.whiteBright('├'), chalk.keyword('aqua')(`[  GRUPO  ]`), ...args)
    }

    store(...args) {
        console.log(chalk.whiteBright('├'), chalk.keyword('aqua')(`[  ARMAZENAR  ]`), ...args)
    }

    store(...args) {
        console.log(chalk.whiteBright('├'), chalk.keyword('aqua')(`[  ARMAZENAR  ]`), ...args)
    }

    error(...args) {
        console.log(chalk.whiteBright('├'), chalk.keyword('red')('[  ERRO  ]'), ...args)
    }
}

module.exports = {
    logger: new Logger(),
}
