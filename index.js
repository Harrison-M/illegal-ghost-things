const deck = require('deck');
const level = require('level');
const qauth = require('qauth');
const Twitter = require('twitter');

const db = level(__dirname + '/used.db');

qauth.init().then(function (twitterConfig) {
    const client = new Twitter(twitterConfig);

    client.get('statuses/user_timeline', { count: 200, include_rts: false, screen_name: 'ghost_things' }, function (err, tweets) {
        if (err) {
            console.error(err);
            return;
        }
        const shuffled = deck.shuffle(tweets);
        (function uniqueTweet(tweets) {
            const toUse = tweets.shift();
            db.get(toUse.id, function(err) {
                if (err && !err.notFound) {
                    console.error(err);
                    return;
                } else if (!err) {
                    return uniqueTweet(tweets);
                }
                const newTweet = 'illegal ' + toUse.text.replace(/~/g, '').replace(/@\S+ /g, '');
                client.post('statuses/update', { status: newTweet }, function(err, tweet) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    db.put(toUse.id, tweet.id);
                    process.exit();
                });
            });
        })(shuffled);
    });
});
