class Config extends require( './Module' ) {
	
	Load() {
		if ( !this.FS )
			this.FS = require( 'fs' );
		
		if ( !this.YAML )
			this.YAML = require( 'yaml' );
		
		if ( !this.FS.existsSync( 'config.yml' ) )
			throw new Error( 'Configuration not found! Please copy config.yml.sample to config.yml and configure as necessary.' );
		
		try {
			var config = this.YAML.parse( this.FS.readFileSync( 'config.yml' ).toString().replace( /\t/g, ' ' ) );
		} catch ( e ) {
			throw new Error( 'Malformed/invalid config.yml, please fix (or copy from config.yml.sample and configure again) and restart. // ' + e.toString() );
		}
		return config;
	}
	
}

module.exports = Config;
