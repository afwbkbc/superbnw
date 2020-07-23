class time extends require( './iq' ) {
	
	Receive( data ) {
		super.Receive( data );
		
		//console.log( 'PING', this.Name, data );
		
		this.Log( 2, 'Time: ' + this.Parent.attrs.from );
		
		function z( n ) {
			if ( n <= 9 ) {
				return '0' + n;
			}
			return n;
		}

		var date = new Date();
		
		this.C.SendXml( [ 'iq', {
			from: this.Parent.attrs.to,
			to: this.Parent.attrs.from,
			id: this.Parent.attrs.id,
			type: 'result',
		}, [
			[ 'time', {
				xmlns: 'urn:xmpp:time',
			}, [
				[ 'tzo', {}, '00:00' ],
				[ 'utc', {}, date.getFullYear() + "-" + z( date.getMonth() + 1 ) + "-" + z( date.getDate() ) + "T" + z( date.getHours() ) + ":" + z( date.getMinutes() ) + ":" + z( date.getSeconds() ) + 'Z' ],
			]],
		]]);
		

	}
	
}

module.exports = time;
