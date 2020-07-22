class sent extends require( './message' ) {
	
	Receive( data ) {
		super.Receive( data );
		
		var forwarded = data.getChild( 'forwarded' );
		var message = forwarded ? forwarded.getChild( 'message' ) : data;
		
		var body = message.getChild( 'body' );
		
		if ( body ) {
			this.C.Log( 2, 'Sent: <' + message.attrs.from + '> ' + body.text() );
			this.C.Callbacks.OnSend({
				from: message.attrs.from,
				to: message.attrs.to,
				text: body.text(),
			});
		}
		
	}
	
}

module.exports = sent;
