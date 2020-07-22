class ping extends require( './iq' ) {
	
	Receive( data ) {
		super.Receive( data );
		
		//console.log( 'PING', this.Name, data );
		
		this.Log( 2, 'Ping: ' + this.Parent.attrs.from );
		
		this.C.SendXml( [ 'iq', {
			from: this.Parent.attrs.to,
			to: this.Parent.attrs.from,
			id: this.Parent.attrs.id,
			type: 'result',
		}]);
		

	}
	
}

module.exports = ping;
