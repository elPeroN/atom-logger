// 'use babel';

let home = require('user-home');
var log = require('simple-node-logger');

/* log.info('subscription to channel accepted at ', new Date().toJSON());
log.log('error', 'failed');
log.log('warn', 'be careful');

log.log('hello'); */

export default class CollectorLogger {

    static getLogger() {
        if (!this.logger) {
            this.logger = home+'/atom_logger.log'
            log.createSimpleFileLogger(this.logger);
        }
        return this.logger;
    }
}

let c = new CollectorLogger();
console.log(c.getLogger());
