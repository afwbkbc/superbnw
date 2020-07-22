class Module {
	
	constructor( name, engine ) {
		this.Name = name;
		this.E = engine;
		
		this.Callbacks = {};
	}
	
	SetCallbacks( callbacks ) {
		for ( var k in callbacks ) {
			if ( typeof( this.Callbacks[ k ] ) === 'undefined' )
				this.Callbacks[ k ] = [];
			this.Callbacks[ k ].push( callbacks[ k ] );
		}
	}
	
	RunCallbacks( type, ...args ) {
		if ( typeof( this.Callbacks[ type ] ) !== 'undefined' )
			for ( var k in this.Callbacks[ type ] )
				this.Callbacks[ type ][ k ].apply( this, args );
	}
	
	Configure( config ) {
		this.Config = config ? config : {};
	}

	Log( level, text ) {
		if ( this.E && this.E.M && this.E.M.Logger )
			return this.E.M.Logger.Log( level, this.Name, text );
	}
}

module.exports = Module;
