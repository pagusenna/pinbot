var MongoClient = require('mongodb').MongoClient,
    logger = require('npmlog');

/**
 * Ensures MongoDB has been preinitialised and holds an active instance
 * of its connection driver
 */
class Mongo {
    /**
     * Initialises and connects to the MongoDB database defined by the application
     * settings.
     * @return {Promise} A promise that will be fulfilled when the connection has been established.
     */
    static prepare() {
        return new Promise((resolve, reject) => {
            if(!Mongo.db) {
                MongoClient.connect(process.env.PINBOT_MONGO_URL, (err, db) => {
                    if(err) {
                        logger.error('Mongo', 'Error connecting to MongoDB instance: ', err);
                        reject();
                    } else {
                        logger.verbose('Mongo', `Connected`);
                        Mongo.db = db;
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Shared MongoDB connection driver instance
     * @return {MongoDB}
     */
    static sharedInstance() {
        return Mongo.db;
    }
}

module.exports = Mongo;
