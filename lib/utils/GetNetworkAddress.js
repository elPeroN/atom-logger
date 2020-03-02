'use babel'
var network = require('network');

export default class GetNetworkAddress {

    GetAddress() {
      var res ="ciao";
      network.get_interfaces_list(function(err, obj) {
          try {
              //Errore nella funzione del pacchetto network
              if (err) throw "An error in the \'network\' package occured";
              //Oggetto ritornato vuoto
              else if (obj.length === 0 || obj.length === undefined) throw "No active interfaces found";
              //Trovato qualcosa
              else {
                  //Loop sull'oggetto per trovare prima interfaccia non fittizia (non VM)
                  for (let i=0; i<obj.length; i++) {
                      //Trovato MAC non fittizio, interrompi loop
                      if (!isVmMac(obj[i].mac_address)) {
                          res = {
                              'IpAddr':obj[i].ip_address,
                              'MacAddr':obj[i].mac_address,
                          };
                          break;
                      }
                  }
              }
              //Se non è stato trovato alcun MAC valido
              if (res === null) throw "No valid MAC found";
          }
          catch (err) {
              alert('Error: '+err);
          }
      })
      return res;
    }

    static isVmMac (mac) {
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
				//Il MAC in input combacias
                if (mac.startsWith(invalidMacs[i])) {
                    return true;
                }
            }

        }
        return false;
    }
}
