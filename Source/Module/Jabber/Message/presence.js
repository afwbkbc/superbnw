class presense extends require( '../Message' ) {
	
	Send( data ) {
		
		this.C.SendXml( [ 'presence', {}, [
			[ 'priority', {}, [
				data.priority,
			]],
		]]);
		
	}
	
	Receive( data ) {
		
		this.C.SetOnline( data.attrs.from, data.children[ 0 ].children[ 0 ] );
		
	}
	
}

module.exports = presense;
