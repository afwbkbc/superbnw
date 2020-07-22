class iq extends require( '../Message' ) {
	
	Receive( data ) {
		
		if ( data.children.length >= 1 ) {
			return this.C.ReceiveMessage( 'iq/' + data.children[ 0 ].name, data.children[ 0 ] );
		}
		else {
			console.log( 'UNEXPECTED CHILDREN COUNT', this.Name, data );
		}
	}
	
}

module.exports = iq;
