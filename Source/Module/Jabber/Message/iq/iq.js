class iq extends require( '../../Message' ) {
	
	Receive( data ) {
		
		if ( data.parent && data.parent && data.parent.attrs )
			this.Parent = data.parent;
		
	}
	
	Reply() {
		if ( this.Parent ) {
			
		}
	}

	
	
	SendIq( attrs, data, on_response ) {
		
		attrs.xmlns = 'jabber:client';
		attrs.from = this.C.From;
		attrs.id = this.C.RegisterResponseCallback( on_response );

		this.C.SendXml( [ 'iq', attrs, data ] );
	}
	
}

module.exports = iq;
