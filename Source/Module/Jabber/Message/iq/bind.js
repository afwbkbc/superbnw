class ping extends require( './iq' ) {
	
	Receive( data ) {
		super.Receive( data );
		
		if ( data.parent.attrs.type === 'result' ) {
			this.C.SetSessionId( data.parent.attrs.id );
		}

	}
	
}

module.exports = ping;
