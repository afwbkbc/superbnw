class Module {
	
	constructor( name, engine ) {
		this.Name = name;
		this.E = engine;
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
