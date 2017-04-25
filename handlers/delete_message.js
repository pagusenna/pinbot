const Mongo = require('../shared/mongo');
const pinterest = require('../shared/pinterest');

const handle = function(message) {
    const collection = Mongo.sharedInstance().collection('items');
    collection.findOne({ ts: message.deleted_ts })
        .then((doc) => {
            if(!doc) {
                return;
            }
            pinterest.handleMessageDeletion(doc);
            collection.remove({ ts: message.deleted_ts });
        });
};

module.exports = { handle };
