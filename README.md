node-red-contrib-feedparser-x
========================

A modified version of [node-red-node-feedparser-2](https://github.com/rayps/node-red-contrib-feedparser-2) 

Added persistent seen list, so you need not receive a train of messages when restart node-red



Install
-------

Run the following command in your Node-RED user directory - typically `~/.node-red`

        npm install node-red-contrib-feedparser-x
        
Edit `setting.js`, and search for `contextStorage`. Make some changes like following:

        contextStorage: {
                 default: {
                     module:"memory"
                 },
                 redis: {
                     module:require("node-red-context-redis"),
                     config:{
                         host:"127.0.0.1",
                         port:6379,
                         prefix:"nodered"
                     }
                 }
             },

The most significant change is adding `redis` key as well as its config. 

Obviously, **a redis server must be launched**.

Usage
-----

### input:
`msg.payload` should be assigned as the feed url. 

A recommended method is dragging an `inject` node which intermittently input a url in to this node
 

### output:
Same as  [node-red-node-feedparser](https://flows.nodered.org/node/node-red-node-feedparser)

Bugs reporting and pull requests are welcome!
