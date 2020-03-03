'use babel';

var network = require('network');

export default class GetNetworkAddress {

    static isVmMac(mac) {
        if (mac != null) {
            const invalidMacs = [
                //VMWare
                '00:05:69', '00:1C:14', '00:0C:29', '00:50:56',
                //Virtualbox
                '08:00:27', '0A:00:27',
                //Virtual-PC
                '00:03:FF',
                //Hyper-V
                '00:15:5D'];

                //Loop su array di MAC che si sa essere di VM
                for (let i=0; i<invalidMacs.length; i++) {
                    //Il MAC in input combacia
                    if (mac.startsWith(invalidMacs[i])) {
                        return true;
                    }
                }

            }
            return false;
    }

    static GetAddress() {
        return new Promise(function(resolve, reject) {
            network.get_interfaces_list(function(err, obj) {
                for (let i=0; i<obj.length; i++) {
                    //Trovato MAC non fittizio, interrompi loop
                    if (!(GetNetworkAddress.isVmMac(obj[i].mac_address))) {
                        const x = {
                            'ipAddr':obj[i].ip_address,
                            'macAddr':obj[i].mac_address,
                        };
                        resolve(x);
                    }
                }
                reject();
            })
        })
    }
}

