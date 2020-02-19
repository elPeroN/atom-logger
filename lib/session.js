const URL = "http://aminsep.disi.unibo.it/innometrics/api/";

function Collection() {
    var data;
    var IPAddr;
    var MACAddr;
    var currentUser;
    var server = URL;

    this.getUsr = function() {
        return currentUser;
    }
    this.setUsr = function(_usr) {
        currentUser = _usr;
    }
    this.getIPAddr = function() {
        return IPAddr;
    }
    this.getMACAddr = function() {
        return MACAddr;
    }
    this.setIPAddr = function() {
        fetch('https://www.cloudflare.com/cdn-cgi/trace')
            .then(response => {
                return(response.text());
            })
            .then(text => {
                let regExp = /ip/g;
                alert(text.match(regExp));
            })
    }
    this.setMACAddr = function() {
    }
    this.getServer = function() {
        return server;
    }
}

module.exports.Collection = Collection;