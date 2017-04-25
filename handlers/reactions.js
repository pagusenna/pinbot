const Mongo = require('../shared/mongo');
const Pinterest = require('../shared/pinterest');

const handleReactionAdded = function(event) {
    if(event.item.type != 'message') {
        return;
    }
    const collection = Mongo.sharedInstance().collection('items');
    collection.findOne({ ts: event.item.ts })
        .then((doc) => {
            if(!doc) {
                return;
            }
            if(event.reaction in doc.reactions) {
                doc.reactions[event.reaction]++;
            } else {
                doc.reactions[event.reaction] = 1;
            }
            collection.replaceOne({ ts: event.item.ts }, doc, () => {
                Pinterest.handleMessage(doc)
                    .then((props) => {
                        Object.keys(props).forEach((k) => {
                            if(!props[k]) {
                                delete doc.pins[k];
                            } else {
                                doc.pins[k] = props[k];
                            }
                        });
                        collection.replaceOne({ ts: event.item.ts }, doc)
                    });
            });
        });
}

const handleReactionRemoved = function(event) {
    if(event.item.type != 'message') {
        return;
    }
    const collection = Mongo.sharedInstance().collection('items');
    collection.findOne({ ts: event.item.ts })
        .then((doc) => {
            if(!doc) {
                return;
            }
            if(!(event.reaction in doc.reactions)) {
                return;
            }
            doc.reactions[event.reaction]--;
            if(doc.reactions[event.reaction] <= 0) {
                delete doc.reactions[event.reaction];
            }
            collection.replaceOne({ ts: event.item.ts }, doc, () => {
                Pinterest.handleMessage(doc)
                    .then((props) => {
                        Object.keys(props).forEach((k) => {
                            if(!props[k]) {
                                delete doc.pins[k];
                            } else {
                                doc.pins[k] = props[k];
                            }
                        });
                        collection.replaceOne({ ts: event.item.ts }, doc)
                    });
            });
        });
}

module.exports = { handleReactionAdded, handleReactionRemoved };
