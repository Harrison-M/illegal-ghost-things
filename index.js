var deck = require('deck');
var LevelDB = require('node-leveldb');
var qauth = require('qauth');
var Twitter = require('twitter');

LevelDB.open(__dirname + '/used.db');

qauth.init().then(function (twitterConfig) {
    var client = new Twitter(twitterConfig);

    client.get('statuses/user_timeline', { count: 200, include_rts: false, screen_name: 'ghost_things' }, function (err, tweets) {
        if (err) {
            console.error(err);
            return;
        }
        var shuffled = deck.shuffle(tweets);
        (function uniqueTweet(tweets) {
            var toUse = tweets.shift();
            if (LevelDB.get(toUse.id)) {
                return uniqueTweet(tweets);
            }

            var newTweet = 'illegal ' + toUse.text.replace(/~/g, '').replace(/^@.* /, '');
            client.post('statuses/update', {status: newTweet}, function(err, tweet) {
                if (err) {
                    console.error(err);
                    return;
                }
                LevelDB.set(toUse.id, tweet.id);
                process.exit();
            });
        })(tweets);
    });
});
