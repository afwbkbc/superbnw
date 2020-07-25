class PGP extends require( './Module' ) {
	
	Init() {
		
		this.DeletedMessages = {};
	}
	
	AttachToBnw( bnw ) {
		this.Bnw = bnw;
		
		if ( !this.Config.Enabled )
			return;
		
		this.Bnw.SetCallbacks({
			OnSend: ( data ) => {
				
				data.text += '\n\n\  // protected by SuperBnW ( https://github.com/afwbkbc/superbnw )\n';
				
			},
			OnReceive: ( data ) => {
				if ( data.reply_id ) {
					//console.log( 'GOT REPLY!!!!', data );
					if ( this.Config.KillOnSight.indexOf( data.author ) >= 0 ) {
						this.DeleteMessage( data, '@' + data.author + ' is in blacklist' );
					}
				}
				else {
					//console.log( 'GOT POST!!!', data );
				}
			},
			OnDelete: ( data ) => {
				var message_id = data.reply_id ? data.reply_id : data.post_id;
				var message = this.DeletedMessages[ message_id ];
				if ( typeof( message ) !== 'undefined' ) {
					// it's confirmation of message deleted by us
					
					this.Log( 2, 'Deletion of ' + message_id + ' confirmed.' );
					
					delete this.DeletedMessages[ message_id ];
					
					this.RunCallbacks( 'OnDelete', message );
				}
			},
		})
	}
	
	DeleteMessage( data, reason ) {
		var message_id = data.reply_id ? data.reply_id : data.post_id;
		
		if ( typeof( this.DeletedMessages[ message_id ] ) !== 'undefined' )
			return; // shouldn't ever happen but what if
		
		this.Log( 2, 'Deleting ' + message_id + ' ( by @' + data.author + ', text: "' + data.text.replace( /\n/g, '\\n' ) + '", reason: "' + reason + '" )' );
		
		// we can't guarantee message deletion until bnw confirmation, so store it first
		this.DeletedMessages[ message_id ] = {
			message: data,
			reason: reason,
			created_at: new Date(),
		};
		
		// now send 'delete' command to bnw and wait for confirmation
		this.Bnw.DeleteMessage( message_id );
	}
	
}

module.exports = Sentinel;
