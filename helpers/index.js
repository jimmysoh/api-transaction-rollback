exports.constructCallbacks = (counter, start, executable, callbacks, history, undo) => {
	if(counter === start) {
	    if(undo) {
	        callbacks.push(function(callback) {
	            executable.undo(history).then((result) => {
	                callback(null, result);
	            }).catch((err) => {
	                callback(counter, null);
	            });
	        });
	    } else {
	        callbacks.push(function(callback) {
	            executable.do().then((result) => {
	                history[counter] = result;
	                callback(null, result);
	            }).catch((err) => {
	                callback(counter, null);
	            });
	        });
	    }
	} else {
	    if(undo) {
	        callbacks.push(function(args, callback) {
	            if(args) {
	                executable.undo(history).then((result) => {
	                    callback(null, result);
	                }).catch((err) => {
	                    callback(counter, null);
	                });
	            } else {
	                callback(null, {});
	            }
	        });
	    } else {
	        callbacks.push(function(args, callback) {
	            if(args) {
	                executable.do(args).then((result) => {
	                    history[counter] = result;
	                    callback(null, result);
	                }).catch((err) => {
	                    callback(counter, null);
	                });
	            } else {
	                callback(null, {});
	            }
	        });
	    }
	}
}