const Mongo = require('../shared/mongo');
const logger = require('npmlog');
const extractURLS = require('../shared/uri_helper');

const handle = function(message) {
    if(!message.text) {
        return;
    }
    const matches = extractURLS(message.text);
    if(matches.length == 0) {
        return;
    }
    const msg = {
        ts: message.ts,
        channel: message.channel,
        user: message.user,
        text: message.text,
        reactions: {},
        pins: {},
        url: matches[0]
    };
    const collection = Mongo.sharedInstance().collection('items');
    collection.findOne({ ts: msg.ts })
        .then((doc) => {
            if(!doc) {
                collection.insertOne(msg)
                    .then(() => logger.info('NewMessageHandler', `Inserted message with TS ${msg.ts}`));
            }
        });
};

module.exports = { handle };
