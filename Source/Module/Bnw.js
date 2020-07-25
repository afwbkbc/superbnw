class Bnw extends require( './Module' ) {
	
	Init() {
		this.BnwJid = 'bnw@bnw.im';
		this.BnwPostIdLength = 1 + 6;
		this.BnwReplyIdLength = this.BnwPostIdLength + 1 + 3;
		
		this.IsConnected = false;
		this.FixingInterface = false;
		
		this.GetMessageCallbacks = {};
		this.PendingPostedMessagesQueue = [];
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
					
					var data = {
						entities_at_start: {
							'*': [],
							'!': [],
							'@': null,
							'#': null,
						},
						text: null,
					};
					
					var msg = message.text.trim();
					
					if (
						[ 'D ', '! ', 'S ', 'U ', '? ' ].indexOf( msg.substring( 0, 2 ).toUpperCase() ) >= 0 ||
						[ '!! ', 'BL ', 'PM ' ].indexOf( msg.substring( 0, 3 ).toUpperCase() ) >= 0 ||
						[ 'JID ', 'SET ' ].indexOf( msg.substring( 0, 4 ).toUpperCase() ) >= 0 ||
						[ 'USERLIST ', 'REGISTER ' ].indexOf( msg.substring( 0, 9 ).toUpperCase() ) >= 0 ||
						[ 'INTERFACE ' ].indexOf( msg.substring( 0, 10 ).toUpperCase() ) >= 0 ||
						[ 'S', 'BL', 'JID', 'ON', 'OFF', 'HELP', 'LOGIN', 'VCARD', 'PING', 'SET', 'USERLIST' ].indexOf( msg.toUpperCase() ) >= 0
					) {
						// system command, so not a posting 
					}
					else {

						var delimiters_at_start = ' \t\n';
						
						var last_container = null;
						
						// parse stuff like tags / clubs at start, consume msg in the process
						while ( Object.keys( data.entities_at_start ).indexOf( msg[ 0 ] ) >= 0 ) {
							var need_break = false;
							var end = -1;
							for ( var d of delimiters_at_start ) {
								var newend = msg.indexOf( d, 1 );
								if ( ( end < 0 ) || ( ( newend >= 0 && newend < end ) ) ) {
									end = newend;
								}
							}
							if ( end < 0 )
								end = msg.length;
							var value = msg.substring( 1, end );
							var container = data.entities_at_start[ msg[ 0 ] ];
							if ( typeof( container ) === 'object' && container !== null ) {
								if ( container.length < 5 ) {
									last_container = msg[ 0 ];
									container.push( value );
								}
								else {
									// only 5 tags or clubs allowed, treat remaining part as text
									break;
								}
							}
							else if ( container !== null ) {
								// only one object allowed, treat remaining part as text
								break;
							}
							else {
								data.entities_at_start[ msg[ 0 ] ] = value; // only one of these is allowed, treat remaining part as text
								need_break = true;
							}
							msg = msg.substring( end + 1 ).trim();
							if ( need_break )
								break;
						}
						
						if ( msg.length === 0 ) {
							if ( data.entities_at_start[ '*' ].length + data.entities_at_start[ '!' ].length > 1 )
								// only single-value search is possible, if there are multiple - treat last one as text
								msg = last_container + data.entities_at_start[ last_container ].pop();
						}
						
						if ( msg.length ) {
							
							// it's a posting!
							data.text = msg;
							
							// store text in queue so that when 'post posted' confirmation comes from bnw we can link id to it 
							this.PendingPostedMessagesQueue.push( data );
							
							//console.log( 'POST|' + msg + '|', data );
							
						}
						
					}
					
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
					else if ( message.text === 'OK. Interface changed.' ) {
						if ( this.FixingInterface )
							this.FixingInterface = false;
						else
							this.FixInterface();
					}
					else if ( 
						message.text.indexOf( 'OK. Message ' ) === 0 ||
						message.text.indexOf( 'OK. Comment ' ) === 0
					) {
						
						var id_start = 'OK. Message '.length;
						if ( message.text[ id_start ] === '#' ) // sometimes message starts with # but not always
							id_start++;
						var tmp = message.text.substring( id_start );
						var id_end = tmp.indexOf( ' ' );
						if ( id_end >= 0 ) {
							var id = '#' + tmp.substring( 0, id_end );
							tmp = tmp.substring( id_end + 1 );

							if ( tmp.indexOf( 'has been delivered to ' ) >= 0 ) {
								// we posted post or reply
								var slash_pos = id.indexOf( '/' );
								var post_id = null;
								var reply_id = null;
								if ( slash_pos >= 0 ) {
									// reply
									post_id = id.substring( 0, slash_pos );
									reply_id = id;
								}
								else {
									// post
									post_id = id;
								}
								
								if ( post_id && post_id.length === this.BnwPostIdLength && ( !reply_id || reply_id.length === this.BnwReplyIdLength ) ) {
									
									// get message body from bnw
									this.GetMessage( id, ( data ) => {

										// pass everything to callbacks
										this.RunCallbacks( 'OnSend', data );
										
									});
									return;
								}
							}
							else if ( tmp.indexOf( 'removed.' ) === tmp.length - 'removed.'.length ) {

								var data = {};
								var slash_pos = id.indexOf( '/' );
								if ( slash_pos >= 0 ) {
									// reply
									data.post_id = id.substring( 0, slash_pos );
									data.reply_id = id;
								}
								else {
									// post
									data.post_id = id;
								}
								
								this.Log( 3, 'Deleted: <' + id + '>' );
								this.RunCallbacks( 'OnDelete', data );
							}
							
						}
					}
					else {
						
						// message(s) in response
						
						var callback = null;
						var data = {};
						
						var first_line_end = message.text.indexOf( '\n' );
						var first_line = ( first_line_end < 0 ? message.text : message.text.substring( 0, first_line_end ) );
						if ( first_line === 'Search results:' ) {
							// ok, this bullshit can't be parsed, because there are no delimiters between messages, anyone can fake bnw output in his message and screw parser
							// bnw protocol is shit, stiletto mudaq
							// but we can still use Search Results to verify our waiting queue
							
							var results = message.text.substring( first_line_end + 1 ).trim();
							
							//console.log( 'SEARCH RESULTS', results );
							//console.log( 'QUEUE', this.PendingPostedMessagesQueue );
							
							// try to find every pending message there ( and consume result if found )
							for ( var k in this.PendingPostedMessagesQueue ) {
								var m = this.PendingPostedMessagesQueue[ k ];
								
								// message starts with @username
								var start_pos;
								while ( ( start_pos = results.indexOf( '@' + this.Config.Nickname + ':' ) ) >= 0 ) {
									
									var potential_match = results.substring( start_pos );
									
									var first_line_ends = potential_match.indexOf( '\n' );
									if ( first_line_ends < 0 ) {
										
										// something is very wrong
										break;
									}
									
									start_pos = first_line_ends + 1;
									
									var first_line = potential_match.substring( 0, first_line_ends ).trim();
									var colon_pos = first_line.indexOf( ':' );
									var tags_clubs = first_line.substring( colon_pos + 1 ).trim();
									
									if ( tags_clubs.length > 0 ) {
										// compare tags/clubs with ones we sent in message
										tags_clubs += ' '; // add space for easier searching
										for ( var tck of '*!' ) {
											for ( var kk in m.entities_at_start[ tck ] ) {
												var tc = m.entities_at_start[ tck ][ kk ];
												var value = tck + tc + ' ';
												var tc_pos = tags_clubs.indexOf( value );
												if ( tc_pos < 0 ) {
													// one of our tags/clubs not found, this isn't message we're looking for
													continue;
												}
												else {
													// we found this tag/club, consume it from tags_clubs and check others
													tags_clubs = tags_clubs.substring( 0, tc_pos ) + tags_clubs.substring( tc_pos + value.length );
												}
												//console.log( 'CHECK', '| ' + tck + tc + '|', tags_clubs, m );
											}
										}
										if ( tags_clubs.length > 0 ) {
											// some tags/clubs weren't consumed, this isn't message we're looking for
											continue;
										}
									}
									
									// we're still here, it means there were no tags/clubs or those that matched our expectations
									// now compare text
									var text = potential_match.substring( first_line_ends + 1, first_line_ends + 1 + m.text.length );

									if ( text === m.text ) {
										
										var last_line = potential_match.substring( first_line_ends + 1 + m.text.length + 1 );
										var last_line_end = last_line.indexOf( '\n' );
										if ( last_line_end < 0 )
											last_line_end = last_line.length;
										last_line = last_line.substring( 0, last_line_end ).trim();
										if ( last_line[ 0 ] !== '#' ) {
											// something's wrong
											continue;
										}
										
										var id_end = last_line.indexOf( ' ', 1 );
										if ( id_end < 0 ) {
											// something's wrong
											continue;
										}
										
										var id = last_line.substring( 0, id_end );
										
										var slash_pos = id.indexOf( '/' );
										if ( slash_pos >= 0 ) {
											m.post_id = slash_pos.substring( 0, slash_pos );
											m.reply_id = id;
										}
										else {
											m.post_id = id;
										}
										
										if ( !m.post_id || m.post_id.length !== this.BnwPostIdLength || ( m.reply_id && m.reply_id.length !== this.BnwReplyIdLength ) ) {
											// something's wrong
											delete m.post_id;
											if ( m.reply_id )
												delete m.reply_id;
											continue;
										}
										
										// at this point we have both text, id and callback(s), everything checked and is valid
										// so now we just need to prepare data, clean up and call callbacks
										m.tags = m.entities_at_start[ '*' ];
										m.clubs = m.entities_at_start[ '!' ];
										if ( m.entities_at_start[ '#' ] )
											m.reply_to = '#' + m.entities_at_start[ '#' ];
										delete m.entities_at_start;
										delete this.PendingPostedMessagesQueue[ k ];
										
										var callbacks = this.GetMessageCallbacks[ id ];
										delete this.GetMessageCallbacks[ id ];
										for ( var cbk in callbacks )
											callbacks[ cbk ]( m );
									}
									
									break;
								}
							}
							
							return;
						}
						else {
							var last_line_start = message.text.lastIndexOf( '\n' );
							if ( first_line_end >= 0 && last_line_start >= 0 ) {
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
													
													if ( message.text[ last_line_start ] === '\n' )
														last_line_start--;
													data.text = message.text.substring( first_line_end + 1, last_line_start );
													
													// determine if it's post or reply
													var slash_pos = id.indexOf( '/' );
													if ( slash_pos >= 0 && preauthor_stuff === 'Reply by ' ) {
														
														// reply
														data.post_id = id.substring( 0, slash_pos );
														data.reply_id = id;
														
													}
													else if ( slash_pos < 0 ) {
														
														// post
														data.post_id = id;
														
													}
													if ( data.post_id && data.post_id.length === this.BnwPostIdLength && ( !data.reply_id || data.reply_id.length === this.BnwReplyIdLength ) ) {
														
														if ( data.author == this.Config.Nickname ) { // our own messages need to be handled differently
															
															// check if it matches any of sent messages
															for ( var k in this.PendingPostedMessagesQueue ) {
																var m = this.PendingPostedMessagesQueue[ k ];
																
																var m_reply_to = '#' + m.entities_at_start[ '#' ];
																var m_id_end = m_reply_to.indexOf( '/' );
																var m_id = m_id_end >= 0 ? m_reply_to.substring( 0, m_id_end ) : m_reply_to;
																	
																if ( data.reply_id && ( m_id === data.post_id ) ) {
																	// it's a reply, pending message is a reply, and their post ids match
																
																	// in replied messages bnw prepends some stuff at beginning
																	// but it's enough to compare ending
																	if ( data.text.substring( data.text.length - m.text.length ) === m.text ) {
																		
																		// all good, update pending message, cleanup and call callbacks
																		
																		m.tags = m.entities_at_start[ '*' ];
																		m.clubs = m.entities_at_start[ '!' ];
																		m.post_id = data.post_id;
																		m.reply_id = data.reply_id;
																		m.reply_to = m_reply_to;
																		delete m.entities_at_start;
																		delete this.PendingPostedMessagesQueue[ k ];
																		
																		var callbacks = this.GetMessageCallbacks[ id ];
																		delete this.GetMessageCallbacks[ id ];
																		for ( var cbk in callbacks )
																			callbacks[ cbk ]( m );

																	}
																}
															}
															
															return;
														}
														else {
															
															this.Log( 3, 'Received: <' + id + '> ' + data.text.replace( /\n/g, '\\n' ) );
															
															// return data to callbacks
															callback = 'OnReceive';
														}
														
													}
												}
											}
										}
									}
								}
							}
						}
						
						if ( callback )
							this.RunCallbacks( callback, data );
						else {
							//console.log( 'INVALID/MALFORMED/UNSUPPORTED MESSAGE', message.text );
						}
					}
				}
			},
			OnUserOnline: ( jid, status ) => {
				if ( jid == this.BnwJid ) {

					this.FixInterface();
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
	
	FixInterface() {
		if ( !this.FixingInterface ) {
			this.FixingInterface = true;
			this.Log( 2, 'Fixing interface' );
			this.Send( 'interface simplified' );
		}
	}
	
	GetMessage( id, callback ) {
		var query_needed = false;
		if ( typeof( this.GetMessageCallbacks[ id ] ) === 'undefined' ) {
			query_needed = true;
			this.GetMessageCallbacks[ id ] = [];
		}
		this.GetMessageCallbacks[ id ].push( callback );
		
		if ( query_needed ) {
			this.Send( id );
		}
	}
	
}

module.exports = Bnw;
