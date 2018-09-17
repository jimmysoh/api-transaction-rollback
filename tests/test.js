const request = require('request');
let transaction = require('../index.js');

run().catch((err) => {
	if(err) console.log(err);
})

async function run() {
	console.log("test start")
	// initialize transaction
	let Transaction = transaction.init();

	// formulate api calls - each with a do and undo function
	let successExecutable = {
		do: async function(args) {
			return await new Promise((resolve, reject) => {
				let options = {
					url: 'http://www.mocky.io/v2/5b9f5e8d3000003900e28c9b'
				}
				request.post(options, (err, response, body) => {
					if(err) reject(Error('error'));
					body = JSON.parse(body);
					resolve(body.data);
				});
			}).catch(err => { throw err });
		},
		undo: async function(args) {
			return await new Promise((resolve, reject) => {
				let options = {
					url: 'http://www.mocky.io/v2/5b9f5e8d3000003900e28c9b'
				}
				request.delete(options, (err, response, body) => {
					if(err) reject(Error('error'));
					body = JSON.parse(body);
					console.log("reversing executable")
					resolve(body.data);
				});
			}).catch(err => { throw err });
		}
	}

	let failureExecutable = {
		do: async function(args) {
			return await new Promise((resolve, reject) => {
				let options = {
					url: 'http://www.mocky.io/v2/5b9f5f8d3000001000e28ca4'
				}
				request.post(options, (err, response, body) => {
					if(err) reject(Error('error'));
					body = JSON.parse(body);
					if(body.status.code !== 200) reject(Error('error')); // failed query
					resolve(body.data);
				});
			}).catch(err => { throw err });
		},
		undo: async function(args) {
			return await new Promise((resolve, reject) => {
				let options = {
					url: 'http://www.mocky.io/v2/5b9f5e8d3000003900e28c9b'
				}
				request.delete(options, (err, response, body) => {
					if(err) reject(Error('error'));
					body = JSON.parse(body);
					resolve(body.data);
				});
			}).catch(err => { throw err });
		}	
	}

	// add calls to transaction and run
	Transaction.add(successExecutable);
	Transaction.add(successExecutable);
	Transaction.add(successExecutable);
	Transaction.add(successExecutable);
	Transaction.add(failureExecutable); // should break here already - 'reverse executable should be printed 4x'
	Transaction.add(successExecutable); // won't be entering here
	Transaction.add(successExecutable);

	await Transaction.run();

	console.log("test complete")
	return;
}