class Message {

	constructor( connection, name ) {
		this.C = connection;
		this.Name = name;
	}
	
	// override these
	Send( data ) {}
	Receive( data ) {}
	
}

module.exports = Message;
