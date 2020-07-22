class iq extends require( '../Message' ) {
	
	Receive( data ) {
		
		if ( data.attrs.type === 'result' ) {
			if ( data.attrs.id ) {
				this.C.SetSessionId( data.attrs.id );
			}
		}
		else {
			console.log( 'HANDLE', this.Name, data );
		}
	}
	
}

module.exports = iq;
