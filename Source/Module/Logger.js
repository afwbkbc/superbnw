class Logger extends require( './Module' ) {
	
	Log( level, from, text ) {
		
		if ( this.Config.LogLevel >= level )
			console.log( '[' + from + '] ' + text );
		
	}
	
}

module.exports = Logger;
