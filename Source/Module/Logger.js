class Logger extends require( './Module' ) {
	
	Log( level, from, text ) {
		
		if ( this.Config.LogLevel >= level )
			console.log( '  '.repeat( level - 1 ) + '[' + from + '] ' + text );
		
	}
	
}

module.exports = Logger;
