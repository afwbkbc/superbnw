class message extends require( '../Message' ) {
	
	Receive( data ) {
		
		var body = data.getChild( 'body' );
		if ( body ) {
			// normal message
			this.C.ReceiveMessage( 'message/' + ( data.attrs.from === this.C.From ? 'sent' : 'received' ), data );
		}
		else {
			// forwarded / broadcasted message
			for ( var k in data.children ) {
				var c = data.children[ k ];
				this.C.ReceiveMessage( 'message/' + c.name, c );
			}
		}
	}
	
}

module.exports = message;
