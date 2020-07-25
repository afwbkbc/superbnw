class PGP extends require( './Module' ) {
	
	Init() {
		
		this.GPG = require( 'node-gpg' );
	}
	
	AttachToBnw( bnw ) {
		this.Bnw = bnw;
		
		if ( !this.Config.Enabled )
			return;
		
		this.Bnw.SetCallbacks({
			OnSend: async ( data ) => {
				
				var signed = await this.GetSignedText( data );
				
				this.RunCallbacks( 'OnSignature', data );
				
				data.text = signed;
				
			},
		})
	}
	
	async GetSignedText( data ) {
		
		var toenc = new Date().toString() + '\n' + ( data.reply_to ? ( 'Reply to ' + data.reply_to ) : 'Posted as new post' ) + '\n';
		var clubs_tags = {
			Clubs: '!',
			Tags: '*',
		}
		for ( var k in clubs_tags ) {
			if ( data[ k.toLowerCase() ] ) {
				toenc += k + ':';
				data[ k.toLowerCase() ].forEach( tag => toenc += ' ' + clubs_tags[ k ] + tag );
				toenc += '\n';
			}
		}
		toenc += '\n' + data.text.trim() + '\n\n\! protected by SuperBnW ( https://github.com/afwbkbc/superbnw ) !\n';
		if ( this.Config.PublicKeyUrl )
			toenc += 'Public key: ' + this.Config.PublicKeyUrl + '\n';
		
		var result = await this.GPG.sign( toenc, this.Config.KeyId );
			
		return result;
	}	
}

module.exports = PGP;
