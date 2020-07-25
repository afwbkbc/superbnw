class received extends require( './message' ) {
	
	Receive( data ) {
		super.Receive( data );

		var forwarded = data.getChild( 'forwarded' );
		var message = forwarded ? forwarded.getChild( 'message' ) : data;
		
		var body = message.getChild( 'body' );
		
		if ( body ) {
			this.C.Log( 3, 'Received: <' + message.attrs.from + '> ' + body.text().replace( /\n/g, '\\n' ) );
			this.C.RunCallbacks( 'OnReceive', this.C.MessageAttrs( message.attrs, body.text() ) );
		}
		
	}
	
}

module.exports = received;
