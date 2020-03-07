'use babel';

let home = require('user-home');
const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath: home+'/atom_logger.log',
        timestampFormat:'YYYY-MM-DD HH:mm:ss'
    }
let log = SimpleNodeLogger.createSimpleFileLogger(opts);

export default class CollectorLogger {

    static warn(msg) {
        log.log('warn',msg);
    }
    static error(msg) {
        log.log('error',msg);
    }
    static info(msg) {
        log.info(msg);
    }
}
