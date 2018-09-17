#api-transaction-rollback

A module that provides an automatic rollback feature should any API call within a series of API calls (transaction) throw an error.

## Installation

To install using npm:

	npm install api-transaction-rollback

To use, simply `require('api-transaction-rollback')` near the beginning of your node code.

## Documentation

__Basic Example__

````js
const request = require('request');
let transaction = require('api-transaction-rollback');

exports.apiCallChain = async () => {
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
			// args will contain the object resolved by the above 'do' method
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
					if(body.status.code !== 200) reject(Error('error'));
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

	// finally executes transaction
	await Transaction.run();
	return 'done';
}
 
````
