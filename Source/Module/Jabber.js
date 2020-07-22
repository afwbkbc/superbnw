class Jabber extends require( './Module' ) {
	
	Init() {
		
		const { client, xml } = require('@xmpp/client');
		this.CLIENT = client;
		this.XML = xml;
		this.JABBER = require( '@xmpp/jid' );
		this.MD5 = require( 'md5' );
		
		this.BnwJid = 'bnw@bnw.im';
		
		this.IsOnline = false;
		this.SessionId = null;
		this.ServerFeatures = [];
		this.ResponseCallbacks = {};

		this.Handlers = {};
	}
	
	Connect( callbacks ) {
		
		if ( this.Connection )
			this.Disconnect();
		
		if ( !this.Config.ID )
			throw new Error( 'Please specify Jabber ID!' );
		if ( !this.Config.Password )
			throw new Error( 'Please specify Jabber password!' );
		
		this.Callbacks = callbacks;
		callbacks.OnConnecting( this.Config.ID );
		
		var addr = this.JABBER( this.Config.ID );
		
		this.Resource = 'SuperBnW';
		
		this.From = addr.getLocal() + '@' + addr.getDomain() + '/' + this.Resource;
		this.Server = addr.getDomain();
		
		this.Client = new this.CLIENT({
			service: this.Server,
			domain: this.Server,
			resource: this.Resource,
			username: addr.getLocal(),
			password: this.Config.Password,
		});
		
		this.Client
			.on( 'error', ( e ) => {
				callbacks.OnError( e.toString() );
				this.Disconnect();
			})
			.on( 'offline', () => {
				this.Disconnect();
			})
			.on( 'online', () => {
				//callbacks.OnConnect();
			})
			.on('status', (status, value) => {
				this.Log( 2, 'Status: ' + status );
				if ( status == 'online' ) {
					
					this.Log( 2, 'Getting server info' );
					this.SendIq( 'query' );
					
					/*this.Client.send( // set 'online' status
						this.XML( 'presence',
							this.XML( 'priority', [ 1 ] )
						)
					);*/
				}
			})
			//.on('send', data => console.log('send:', data.toString ? data.toString() : data))
			.on('stanza', ( stanza ) => {
				
				this.ReceiveStanza( stanza );
				/*if ( stanza.name == 'presence' ) {
					console.log( 'PRESENCE', stanza.attrs.from );
					if ( stanza.attrs.from == 'bnw@bnw.im' ) {
						// only here we are truly online
						if ( !this.IsOnline ) {
							this.IsOnline = true;
							callbacks.OnConnect();
							this.Client.send(
								this.XML( 'message', { type: 'chat', to: 'bnw@bnw.im', id: Math.random() },
									this.XML( 'body', {}, 'ON' )
								)
							)
							this.Client.send(
								this.XML( 'message', { type: 'chat', to: this.Config.ID, id: Math.random() },
									this.XML( 'body', {}, 'test broadcast' )
								)
							);
						}
					}
				}
				else if ( stanza.name == 'message' ) {
					var msg = stanza.getChild( 'body' ).text();
					console.log( 'MESSAGE', stanza.attrs.from, msg );
					if ( stanza.attrs.from.substring( 0, this.Config.ID.length ) == this.Config.ID ) {
						console.log( 'PONG' );
						this.Client.send(
							this.XML( 'message', { type: 'chat', to: stanza.attrs.from, id: Math.random() },
								this.XML( 'body', {}, 'PONG' )
							)
						);
					}
				}
				else if ( stanza.name == 'iq' ) {
					switch ( stanza.attrs.type ) {
						case 'get': {
							for ( var c of stanza.children ) {
								console.log( 'C', c );
							}
							break;
						}
						case 'result': {
							// nobody cares
							break;
						}
						default:
							console.log( 'unknown iq type "' + stanza.attrs.type + '"', stanza );
					}
				}
				else {
					console.log( 'S', stanza );
				}
				/*console.log('stanza string:', stanza.toString())
				if (stanza.name == "message") {
					const msg = stanza.getChild('body').text()
					if (msg == "close") {
						client.close()
						return
					}
					const to = stanza.attrs.from
					client.send(
						xml('message', { to },
							xml('body', {}, msg)
						)
					)
				}*/
			})
			.start()
			.catch( (e)=> {} )
		;
		
		/*this.Connection = new this.XMPP.Client({
			jid: this.Config.JID,
			password: this.Config.Password,
		});
		
		this.Connection
			.on( 'error', ( error ) => {
				settings.OnError( error.toString() );
				this.Disconnect();
			})
			.on( 'offline', () => {
				this.Disconnect();
			})
			.on( 'online', () => {
				settings.OnConnect();
			})
			.on( 'stanza', ( stanza ) => {
				console.log( 'MESSAGE', stanza.attrs );
				if ( stanza.attrs.from == 'bnw@bnw.im' ) {
					var body = stanza.getChild( 'body' );
					if ( body ) {
						var message = body.getText();
						settings.OnMessage( message );
					}
				}
			})
		;*/
		
	}
	
	GetHandler( type ) {
		if ( typeof( this.Handlers[ type ] ) === 'undefined' ) {
			try {
				var handler_class = require( './Jabber/Message/' + type );
				this.Handlers[ type ] = new handler_class( this, type );
			} catch ( e ) {
				console.log( 'unsupported message type "' + type + '"' );
				this.Handlers[ type ] = null;
			}
		}
		return this.Handlers[ type ];
	}
	
	ReceiveMessage( message, data ) {
		if ( data.attrs && data.attrs.id && typeof( this.ResponseCallbacks[ data.attrs.id ] ) === 'function' ) {
			var cb = this.ResponseCallbacks[ data.attrs.id ];
			delete this.ResponseCallbacks[ data.attrs.id ];
			if ( data.children.length >= 1 )
				return cb( data.children[ 0 ] );
			else
				return cb( null );
		}
		else {
			var handler = this.GetHandler( message );
			if ( handler ) {
				var body = data.getChild( 'body' );
				if ( body )
					data.body = body;
				return handler.Receive( data );
			}
		}
	}
	
	ReceiveStanza( stanza ) {
		
		if ( !stanza.name || !stanza.attrs || !stanza.parent || !stanza.children ) {
			console.log( 'invalid stanza received', stanza );
			return;
		}
		
		if ( stanza.attrs.from == this.Config.ID + '/' + this.Resource )
			return; // don't react to own messages
		
		this.ReceiveMessage( stanza.name, stanza );
	}

	SendMessage( message, data, callback ) {
		var handler = this.GetHandler( message );
		if ( handler )
			handler.Send( data ? data : {}, callback );
	}
	
	SendIq( message, data, callback ) {
		return this.SendMessage( 'iq/' + message, data, callback );
	}
	
	Send( to, text ) {
		this.Client.send(
			this.XML( 'message', { type: 'chat', to: to, id: this.MD5( Math.random() ) },
				this.XML( 'body', {}, text )
			)
		);
	}
	
	SendXml( data ) {
		var genxml = ( data ) => {
			if ( typeof( data ) === 'object' ) {
				var children = data[ 2 ];
				var a = [ data[ 0 ], data[ 1 ] ];
				for( var k in children )
					a.push( genxml( children[ k ] ) );
				return this.XML.apply( null, a );
			}
			else
				return data;
			
		};
		
		var xml = genxml( data );
		
		this.Log( 3, 'Send: ' + xml.toString() );
		
		this.Client.send( xml );
	}
	
	Disconnect() {
		if ( this.IsOnline ) {
			this.IsOnline = false;
			this.Client.close().catch( () => {} );
			this.SessionId = null;
			this.ResponseCallbacks = {};
			this.ServerFeatures = [];
			var client = this.Client;
			delete this.Client;
			this.Callbacks.OnDisconnect();
		}
	}
	
	Reconnect() {
		
		var reconnect_seconds = 2;
		
		if ( this.ReconnectTimeout )
			clearTimeout( this.ReconnectTimeout );
		this.Callbacks.OnReconnect( reconnect_seconds );
		this.ReconnectTimeout = setTimeout( () => {
			delete this.ReconnectTimeout;
			this.Connect( this.Callbacks );
		}, reconnect_seconds * 1000 );
	}
	
	SendPresence() {
		this.Log( 2, 'Broadcasting presence' );
		this.SendMessage( 'presence', {
			priority: 100,
		});
	}
	
	SetSessionId( id ) {
		//if ( this.SessionId )
			//this.Log( 2, '(warning) duplicate SetSession' );
		this.Log( 2, 'SessionId: ' + id );
		this.SessionId = id;
	}
	
	SetOnline( jid, status ) {
		if ( jid == this.BnwJid ) {
			this.Log( 2, 'Online: ' + jid + ' ( ' + status + ' )' );
			
			this.Send( this.BnwJid, 'ON' );
			
			this.Callbacks.OnConnect();
			
		}
	}
	
	RegisterResponseCallback( callback ) {
		var id;
		do {
			id = this.MD5( Math.random() );
		} while ( typeof( this.ResponseCallbacks[ id ] ) !== 'undefined' );
		this.ResponseCallbacks[ id ] = callback;
		return id;
	}
	
	SetServerFeatures( features ) {
		this.Log( 4, 'Server features: ' + JSON.stringify( features ) );
		this.ServerFeatures = features;
		
		if ( this.ServerFeatures.indexOf( 'urn:xmpp:carbons:2' ) >= 0 ) {
			
			this.Log( 2, 'Enabling XEP-0280' );
			this.SendIq( 'enable', {
				xmlns: 'urn:xmpp:carbons:2',
			}, ( response ) => {
				if ( response.error ) {
					this.Log( 3, 'Error: ' + response.error );
					this.Log( 1, 'Warning! Failed to enable XEP-0280 on your server ( ' + this.Server + ' ), continuing without, bot may be unreliable if used simultaneously with another xmpp client on same account!' );
				}
				this.SendPresence();
			});
			
		}
		else {
			this.Log( 1, 'Warning! Your xmpp server ( ' + this.Server + ' ) does not support XEP-0280, bot may be unreliable if used simultaneously with another xmpp client on same account!' );
			this.SendPresence();
		}
	}
}

module.exports = Jabber;
