class Engine {
	
	constructor() {
		
		this.M = {};
		for( var m of [ 'Config', 'Logger', 'Jabber' ] )
			this.M[ m ] = new ( require( './Module/' + m ) )( m, this );
		
	}
	
	HandleError( e ) {
		if ( this.Config && this.Config.Debug && this.Config.Debug.Backtrace )
			console.log( "\n", e );
		else
			console.log( "\nFATAL: " + e.message );
		process.exit( 1 );
	}
	
	Init() {
		try {
			this.Config = this.M.Config.Load();
			for ( var k in this.M ) {
				var m = this.M[ k ];
				m.Configure( this.Config[ k ] );
				if ( m.Init )
					m.Init();
			}
		} catch ( e ) {
			this.HandleError( e );
		}
	}
	
	Run() {
		try {
			this.M.Jabber.Connect({
				OnConnecting: ( jabber_id ) => {
					this.Log( 1, 'Connecting as ' + jabber_id + ' ...' );
				},
				OnConnect: () => {
					this.Log( 1, 'Connection established.' );
				},
				OnDisconnect: () => {
					this.Log( 1, 'Connection lost.' );
				},
				OnReconnect: ( reconnect_seconds ) => {
					this.Log( 1, 'Reconnecting in ' + reconnect_seconds + ' seconds.' );
				},
				OnMessage: ( message ) => {
					console.log( 'MESSAGE', message );
				},
				OnError: ( error ) => {
					this.Log( 1, 'Error: ' + error + '!' );
					if ( error == 'Invalid username or password' )
						this.HandleError( new Error( 'Login failed. Please configure valid Jabber ID and/or password and try again.' ) );
				},
			});
		} catch ( e ) {
			return this.HandleError( e );
		}
	}
	
	Log( level, text ) {
		if ( this.M && this.M.Logger )
			return this.M.Logger.Log( level, 'SuperBNW', text );
	}
	
}

module.exports = Engine;