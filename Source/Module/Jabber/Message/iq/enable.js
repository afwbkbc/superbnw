class query extends require( './iq' ) {
	
	Send( data, callback ) {
		super.Send( data );
		
		this.SendIq( {
			type: 'set',
		},[
			[ 'enable', {
				xmlns: data.xmlns,
			}, [] ]
		], ( response ) => {
			
			if ( callback ) {
				if ( response && response.parent && response.parent.attrs.type === 'error' ) {
					for ( var k in response.parent.children ) {
						var c = response.parent.children[ k ];
						if ( c.name === 'error' ) {
							return callback({
								result: 'error',
								error: ( c.children.length > 0 ) ? c.children[ 0 ].name : 'unspecified error',
							});
						}
					}
				}
				return callback({
					result: 'success',
				});
			}
		});
		
	}
	
	Receive( data ) {
		super.Receive( data );
		//console.log( 'RECEIVED', data );
	}
	
}

module.exports = query;
