const Mongo = require('../shared/mongo');
const NewMessageHandler = require('./new_message');
const extractURLS = require('../shared/uri_helper');
const DeleteMessageHandler = require('./delete_message');
const Pinterest = require('../shared/pinterest');

const handle = function(event) {
    const collection = Mongo.sharedInstance().collection('items');
    collection.findOne({ ts: event.message.ts })
        .then((doc) => {
            if(!doc) {
                event.message.channel = event.channel;
                NewMessageHandler.handle(event.message);
                return;
            }
            const text = event.message.text;
            const matches = extractURLS(text);
            if(matches.length == 0) {
                event.deleted_ts = event.message.ts;
                DeleteMessageHandler.handle(event);
                return;
            }
            if(matches[0].toLowerCase() == doc.url.toLowerCase()) {
                return;
            }
            doc.text = event.message.text;
            doc.url = matches[0];
            collection.replaceOne({ ts: event.message.ts }, doc)
                .then(() => Pinterest.handleMessageDeletion(doc))
                .then(() => Pinterest.handleMessage(doc));
    });
}

module.exports = { handle };
