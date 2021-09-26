// Defining the node program for the tiddlywiki-search user which uses an optional config node for server and creds
// Derived from core node https://github.com/node-red/node-red/blob/master/packages/node_modules/%40node-red/nodes/core/network/21-httprequest.js
// Author Robert Munnoch

module.exports = function(RED) {
    "use strict";
    const got = require("got");
    const util = require("util");
    const promisify = util.promisify;
    const stream = require("stream");
    const fs = require("fs");

    const pipeline = promisify(stream.pipeline);

    function NodeREDAPIModuleNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.name = config.name || node.type;
        node.config = config;

        // If the nodered server config node is defined then use it other wise fall back to local information
        if (config.noderedserver) {
            node.server = RED.nodes.getNode(config.noderedserver)
        }
        else {
            node.error(RED._("nodered.errors.no-server"),msg);
            nodeDone();
            return;
        }
        // // Further debug code while node is in development
        // node.warn("Node debug:");
        // node.warn(JSON.parse(JSON.stringify(node)));

        node.status({});

        const options = {
            prefixUrl: node.server.url,
            timeout: node.config.timeout,
            method: 'GET',
            maxRedirects: 3,
            forever: false,
            headers: {
                "content-type": "application/json",
                "Authorization": "Basic " + new Buffer.from(node.server.credentials.username + ':' + node.server.credentials.password).toString('base64')
            } 
        }
    
        node.upload = function(msg, nodeSend, nodeDone) {
            var preRequestTimestamp = process.hrtime();

            node.status({fill:"blue",shape:"dot",text:"nodered.status.requesting"});

            var path = `nodes`;

            pipeline(
                fs.createReadStream('/local/nodered-nodes-noderedapi-0.1.0.tgz'),
                got.stream.post(path,options),
                new stream.PassThrough()
            ).then((res) => {
                node.error("success");
            }).catch((err) => {
                node.error("failed");
            });

        }

        node.on('input', function(msg, nodeSend, nodeDone) {
            //node.search(msg, nodeSend, nodeDone);
            nodeSend(msg);
            nodeDone();
        });

    }
    RED.nodes.registerType("nodered-module", NodeREDAPIModuleNode);
}
