class Message {

	constructor( connection, name ) {
		this.C = connection;
		this.Name = name;
	}
	
	Log( level, text ) {
		return this.C.Log( level, text );
	}
	
	// override these
	Send( data ) {}
	Receive( data ) {}
	
}

module.exports = Message;
