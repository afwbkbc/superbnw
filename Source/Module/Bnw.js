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
					
					// parse & call callbacks
					
					console.log( 'MESSAGE|' + message.text + '|' );
					
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
						
						// parse && call callbacks
						
						var callback = null;
						var data = {};
						
						var first_line_start = message.text.indexOf( '\n' );
						var last_line_start = message.text.lastIndexOf( '\n' );
						if ( first_line_start >= 0 && last_line_start >= 0 ) {
							var first_line = message.text.substring( 0, first_line_start );
							var last_line = message.text.substring( last_line_start + 1 );
							if ( first_line.length > 0 && last_line.length > 0 ) {
								var author_start = first_line.indexOf( '@' );
								// parse message type
								if ( author_start >= 0 && last_line[ 0 ] === '#' ) {
									// parse author
									var author_end = first_line.indexOf( ':' );
									if ( author_start >= 0 && author_end >= 0 ) {
										data.author = first_line.substring( author_start + 1, author_end );
										var preauthor_stuff = first_line.substring( 0, author_start );
										if ( data.author.length > 0 ) {
											// parse post/reply id
											var id_end = last_line.indexOf( ' ' );
											if ( id_end >= 0 ) {
												var id = last_line.substring( 0, id_end ) ;
												
												// determine if it's post or reply
												var slash_pos = id.indexOf( '/' );
												if ( slash_pos >= 0 && preauthor_stuff === 'Reply by ' ) {
													// reply
													data.post_id = id.substring( 0, slash_pos );
													data.comment_id = id;
													callback = 'OnReceive';
												}
												else if ( slash_pos < 0 ) {
													// post
													data.post_id = id;
													callback = 'OnReceive';
												}
												if ( message.text[ last_line_start ] === '\n' )
													last_line_start--;
												data.text = message.text.substring( first_line_start + 1, last_line_start );
												
											}
										}
									}
								}
							}
							
						}
						
						if ( callback )
							this.RunCallbacks( callback, data );
						else
							console.log( 'INVALID/MALFORMED/UNSUPPORTED MESSAGE', message.text );
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
