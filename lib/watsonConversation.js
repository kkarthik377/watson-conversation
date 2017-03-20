'use strict';

const watson = require('watson-developer-cloud');
const Promise = require('bluebird');
const _ = require('lodash');

module.exports = (input, context) => {
    const conversation = watson.conversation(Object.freeze({
        username: "9832967b-c5a1-48f6-bdbc-6b7ef176adf4",
        password: "jPsJrZeYpuP0",
        version: "v1",
        version_date: "2017-02-03"
    }));

    return new Promise((resolve, reject) => {
        conversation.message({
        workspace_id: "95bd11c6-f809-4cca-917c-a92b0c31d7fa",
        input: input || {},
        context: context || {}
        }, (err, response) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        });
    })
};
