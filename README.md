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

> Tips: `node-red-context-redis` was not released by node-red official in npm any more. But there is 
> a feasible method that install from a git repo:

    npm install git+https://github.com/node-red-hitachi/node-red-context-redis

Obviously, **a redis server must be launched**.

Usage
-----

### input:
`msg.payload` should be assigned as the feed url. 

`msg.init_send` is a boolean value, which when set as `true`, the history message would be 
output, while when set as `false`, it would be not. Default value is `false`

`msg.keep_size` is a int value which default is 30, which was used to keep specified amount of messages. This module 
will keep the latest `keep_size` messages. So, it is best to set the value to 1.5 times or even twice the number of entries in the message source list.

A recommended method is to drag an `inject` node which intermittently input a url in to this node.
 

### output:
Same as  [node-red-node-feedparser](https://flows.nodered.org/node/node-red-node-feedparser)

Bugs reporting and pull requests are welcome!
