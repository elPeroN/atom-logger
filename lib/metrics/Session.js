'use babel';

export default class Session {

	constructor(ipAddr, macAddr) {
		this.ipAddr = ipAddr;
		this.macAddr = macAddr;
	}

	toString(){
		console.log("ipAddr " + this.ipAddr);
		console.log("macAddr " + this.macAddr);
	}
}
