const URI = require('urijs');

const extractURLS = function(text) {
    const matches = [];
    URI.withinString(text, (u) => {
        matches.push(u);
        return u;
    });
    return matches;
}

module.exports = extractURLS;
