class query extends require( './iq' ) {
	
	Send( data ) {
		super.Send( data );
		
		this.SendIq( {
			type: 'get',
			to: this.C.Server,
		}, [
			[ 'query', {
				xmlns: 'http://jabber.org/protocol/disco#info',
			}, [] ]
		], ( response ) => {
			var features = [];
			for ( var k in response.children ) {
				var r = response.children[ k ];
				if ( r.name == 'feature' )
					features.push( r.attrs[ 'var' ] );
			}
			this.C.SetServerFeatures( features );
		});
		
	}
	
	Receive( data ) {
		super.Receive( data );
		console.log( 'RECEIVED', data );
	}
	
}

module.exports = query;
