class presense extends require( '../Message' ) {
	
	Send( data ) {
		
		this.C.SendXml( [ 'presence', {}, [
			[ 'priority', {}, [
				data.priority,
			]],
		]]);
		
	}
	
	Receive( data ) {
		
		if ( data.children[ 0 ] )
			this.C.SetOnline( data.attrs.from, data.children[ 0 ].children[ 0 ] );
		else {
			this.C.SetOnline( data.attrs.from, data );
		}
		
	}
	
}

module.exports = presense;
