'use babel';

let home = require('user-home');
var log = require('simple-node-logger').createSimpleFileLogger(home+'/atom_logger.log');

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
