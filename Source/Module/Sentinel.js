class Bnw extends require( './Module' ) {
	
	Init() {
		this.BnwJid = 'bnw@bnw.im';
		
		this.IsConnected = false;
	}
	
	AttachToConnection( connection ) {
		this.Connection = connection;
		
		this.Connection.SetCallbacks({
			OnConnect: () => {
				
				// init bnw?
				
				//this.RunCallbacks( 'OnConnect' );
			},
			OnDisconnect: () => {
				
				if ( this.IsConnected ) {
					this.RunCallbacks( 'OnDisconnect' );
					this.IsConnected = false;
				}
			},
			OnSend: ( message ) => {
				if ( message.from !== this.Connection.Config.ID )
					return; // something wrong
				
				if ( message.to === this.BnwJid ) {
					
					
					
					//console.log( 'TO BNW', message.from, message.to, message.text );
					
				}
			},
			OnReceive: ( message ) => {
				if ( message.to !== this.Connection.Config.ID )
					return; // something wrong
				
				if ( message.from === this.BnwJid ) {
					if ( message.text === 'OK. Welcome back!' || message.text === 'OK. Welcoooome baaaack, I said.' ) {
						if ( !this.IsConnected ) {
							this.IsConnected = true;
							this.RunCallbacks( 'OnConnect' );
						}
					}
					else if ( message.text === 'OK. C u l8r!' || message.text == 'OK. See you later.' ) {
						this.GoOnline();
					}
					else {
						console.log( 'FROM BNW', message.from, message.to, message.text );
					}
				}
			},
			OnUserOnline: ( jid, status ) => {
				if ( jid == this.BnwJid ) {

					this.GoOnline();
					
				}
			},
			// TODO: onuseroffline
		});

	}
	
	Send( text ) {
		this.Connection.Send( this.BnwJid, text );
	}
	
	GoOnline() {
		this.Log( 2, 'Going online' );
		this.Send( 'ON' );
	}
	
}

module.exports = Bnw;
