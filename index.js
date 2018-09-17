var waterfall = require('async-waterfall');
const { constructCallbacks } = require('./helpers');

let executables = [];
let history = {};
let order = 0;

let Transaction = {
    add: function(executable) {
        executable.index = order++;
        executables.push(executable);
        return;
    },
    run: async function() {
        return await new Promise(async (resolve, reject) => {
            let callbacks = [];
            executables.forEach(async (executable, i) => {
                await new Promise((resolve, reject) => {
                    // convert to callbacks for async waterfall
                    constructCallbacks(i, 0, executable, callbacks, history, false);
                    resolve();
                });
            });

            waterfall(callbacks, (err, result) => {
                if(!err) {
                    cleanUp();
                    resolve();
                } else {
                    let breakPoint = parseInt(err) - 1; // rollback from previous exec onwards
                    let rollbacks = [];
                    for(let i = breakPoint; i >= 0; i--) {
                        let executable = executables[i];
                        let outputHistory = history[i] || null;
                        if(outputHistory) {
                            constructCallbacks(i, breakPoint, executable, rollbacks, outputHistory, true);
                        }
                    }

                    waterfall(rollbacks, (err, result) => {
                        cleanUp();
                        if(err) reject(Error(555)); // temp error code
                        resolve();
                    });
                }
            });
        });
    }
}

let cleanUp = () => {
    executables = [];
    order = 0;
    history = {};
}

module.exports = {
    init: () => {
        return Object.assign({}, Transaction);
    }
}