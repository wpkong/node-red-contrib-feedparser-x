module.exports = function (RED) {
  "use strict";
  let FeedParser = require("feedparser");
  let request = require("request");
  let url = require('url');
  let sha1 = require('sha1');

  function buildKey(url, key) {
    return sha1(url) + "-" + key;
  }

  function FeedParseNode(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    var getFeed = function (msg) {
      if (!msg.payload) {
        node.error(RED._("feedparsex.errors.invalidurl"));
        return;
      }
      let feed_url = msg.payload;
      let parsed_url = url.parse(feed_url);
      if (!(parsed_url.host || (parsed_url.hostname && parsed_url.port)) && !parsed_url.isUnix) {
        node.error(RED._("feedparsex.errors.invalidurl"));
        return;
      }

      let seenKey = buildKey(feed_url, "seen");

      let nodeContext = node.context();
      nodeContext.get(seenKey, "redis", function (error, seen) {
        // get feed seen table
        if (error) {
          node.error(error);
          return;
        }
        if (!seen) seen = {};
        let keys = JSON.parse(JSON.stringify(seen));

        // request feed
        var req = request(feed_url, {timeout: 10000, pool: false});
        //req.setMaxListeners(50);
        req.setHeader('user-agent', 'Mozilla/5.0 (Node-RED)');
        req.setHeader('accept', 'text/html,application/xhtml+xml');

        var feedparser = new FeedParser();

        req.on('error', function (err) {
          node.error(err);
        });

        req.on('response', function (res) {
          if (res.statusCode !== 200) {
            node.warn(RED._("feedparsex.errors.badstatuscode") + " " + res.statusCode);
          } else {
            res.pipe(feedparser);
          }
        });

        feedparser.on('error', function (error) {
          node.error(error);
        });

        feedparser.on('readable', function () {
          let stream = this, article;

          while (article = stream.read()) {  // jshint ignore:line
            let guid = article.guid;
            if (!(guid in seen) || (seen[guid] !== 0 && seen[guid] !== article.date.getTime())) {
              seen[article.guid] = article.date ? article.date.getTime() : 0;

              let data = JSON.parse(JSON.stringify(msg));
              data.topic = article.origlink || article.link
              data.payload = article.description
              data.article = article

              node.send(data);
            }
            delete keys[guid];
          }
        });

        feedparser.on('meta', function (meta) {
        });
        feedparser.on('end', function () {
          // remove all disappeared key
          keys = Object.keys(keys);
          keys.forEach(value => {
            delete seen[value];
          });
          // write back to redis
          nodeContext.set(seenKey, seen, "redis");
        });
      });
    }

    this.on("input", function (msg) {
      getFeed(msg);
    });
  }

  RED.nodes.registerType("feedparse-x", FeedParseNode);
}
