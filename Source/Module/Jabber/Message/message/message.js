class message extends require( '../../Message' ) {
	
/*	SendIq( attrs, data, on_response ) {
		
		attrs.xmlns = 'jabber:client';
		attrs.from = this.C.From;
		attrs.id = this.C.RegisterResponseCallback( on_response );

		this.C.SendXml( [ 'iq', attrs, data ] );
	}*/
	
}

module.exports = message;
