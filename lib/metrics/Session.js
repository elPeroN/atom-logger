'use babel';

export default class Session {

	Session() {
		this.ipAddr = GetNetworkAddress.GetAddress("ip");
		this.macAddr = GetNetworkAddress.GetAddress("mac");
	}

	Session(ipAddr, macAddr) {
		this.ipAddr = ipAddr;
		this.macAddr = macAddr;
	}

	getCurrentSession() {
		if (this.instance == null) {
			this.instance = new Session();
		}
		return this.instance;
	}
}
