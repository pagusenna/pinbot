const PinterestToken = process.env.PINBOT_PINTEREST_TOKEN;
const request = require('request-promise');
const _unfurl = require('unfurl-url');
const cheerio = require('cheerio');
const Promise = require("bluebird");
const targetBoards = {
    'kaaba': 'd3estudio/instalações',
    'iphone': 'd3estudio/produtos-e-serviços'
};
const unfurl = function (url) {
    return new Promise((resolve, reject) => {
        _unfurl.url(url, (error, url) => {
            if(error) {
                return reject(error);
            }
            resolve(url);
        });
    });
};
const extractImage = function(url) {
    return request({
            uri: url,
            transform: (body) => cheerio.load(body)
        })
        .then((cheerio) => {
            const selectors = {
                imageUrl: [
                    $ => $('meta[property="og:image"]').first().attr('content'),
                    $ => $('meta[name="twitter:image"]').first().attr('content'),
                    $ => $('meta[itemprop="image"]').first().attr('content'),
                    $ => $('div > img').first().attr('src')
                ],
                summary: [
                    $ => $('meta[property="og:description"]').first().attr('content'),
                    $ => $('meta[name="twitter:description"]').attr('content'),
                    $ => $('meta[itemprop="description"]').first().attr('content') || $('meta[name="description"]').first().attr('content'),
                    $ => $('title').first().text()
                ]
            }
            const result = {
                pageUrl: url
            };
            Object
                .keys(selectors)
                .forEach((k) => {
                    const sels = selectors[k];
                    let content;
                    sels.forEach((selector) => {
                        const result = selector(cheerio);
                        if(!content) {
                            content = result;
                        }
                    });
                    result[k] = content;
                });
            return result;
        });
}
const createPinterestPin = function(data) {
    return request({
        method: 'POST',
        uri: 'https://api.pinterest.com/v1/pins/',
        qs: {
            access_token: PinterestToken,
        },
        body: {
            link: data.pageUrl,
            image_url: data.imageUrl,
            board: data.board,
            note: data.summary
        },
        json: true
    })
    .then((response) => response.data.id);
}
const destroyPinterestPin = function(pinId) {
    return request({
        method: 'DELETE',
        uri: `https://api.pinterest.com/v1/pins/${pinId}/`,
        qs: {
            access_token: PinterestToken,
        },
        json: true
    })
    .then(() => null);
}

const createPin = function(url, board) {
    return unfurl(url)
        .then((url) => extractImage(url))
        .then((meta) => {
            meta.board = board;
            return createPinterestPin(meta);
        });
};

const handleMessageDeletion = function(msg) {
    if(!msg) {
        return Promise.resolve();
    }
    let pins = msg.pins || {};
    let promises = Object.keys(pins)
        .map((k) => pins[k])
        .map((pinId) => destroyPinterestPin(pinId));
    return Promise.all(promises);
}

const handleMessage = function(msg) {
    let promises = {};
    Object.keys(targetBoards).forEach((reactionName) => {
        let boardName = targetBoards[reactionName];
        if(reactionName in msg.reactions && msg.reactions[reactionName] > 0) {
            if(!(boardName in msg.pins)) {
                promises[boardName] = createPin(msg.url, boardName);
            }
        } else {
            if(boardName in msg.pins) {
                promises[boardName] = destroyPinterestPin(msg.pins[boardName]);
            }
        }
    });
    return Promise.props(promises);
}

module.exports = { handleMessage, handleMessageDeletion };
