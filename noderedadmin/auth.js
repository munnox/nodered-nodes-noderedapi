// Defining the node program for the tiddlywiki-search user which uses an optional config node for server and creds
// Derived from core node https://github.com/node-red/node-red/blob/master/packages/node_modules/%40node-red/nodes/core/network/21-httprequest.js
// Author Robert Munnoch

const utility = require("./utility.js");


module.exports = function(RED) {
    "use strict";

    function NodeREDAPIAuthNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.name = config.name || node.type;
        node.config = config;
        var token = null;

        if (!utility.getservernode(RED, node, config)) {
            return;
        }

        // // Further debug code while node is in development
        // node.warn("Node debug:");
        // node.warn(JSON.parse(JSON.stringify(node)));

        setTimeout(() => {node.status({fill:"gray",shape:"dot",text:"Initialised"})}, 0);

        // node.status({fill:"blue",shape:"dot",text:"init"});

        // const options = {
        //     prefixUrl: node.server.url,
        //     timeout: node.config.timeout,
        //     method: 'GET',
        //     maxRedirects: 3,
        //     forever: false,
        //     headers: {
        //         "content-type": "application/json",
        //         "Authorization": "Basic " + new Buffer.from(node.server.credentials.username + ':' + node.server.credentials.password).toString('base64')
        //     } 
        // }


    
        node.auth = function(msg, nodeSend, nodeDone) {
            var preRequestTimestamp = process.hrtime();

            node.status({fill:"blue",shape:"dot",text:"nodered.status.requesting"});

            switch (node.config.function) {
                case "Check":
                    utility.tokenneeded(node, (options, authreq, auth) => {
                        node.status({fill:"green",shape:"dot",text:"nodered.status.success"});
                        msg.options = options;
                        msg.auth_required = authreq;
                        msg.auth = auth;
                        node.send(msg);
                        if (authreq) {
                            node.trace("Token required:" + JSON.stringify(auth));
                        } else {
                            node.trace("Token not required");
                        }
                    }, (options, reason) => {
                        node.status({fill:"red",shape:"dot",text:"nodered.status.failed"});
                        if (msg.auth_required) {
                            delete msg.auth_required;
                        }
                        msg.options = options;
                        msg.reason = reason;
                        node.send(msg);

                    })
                    break;
                case "Get":
                    utility.gettoken(
                        node,
                        node.server.credentials.username,
                        node.server.credentials.password,
                        (token) => {
                            node.trace("token" + JSON.stringify(token));
                            node.status({fill:"green",shape:"dot",text:"nodered.status.success"});
                            // node.status({fill:"blue",shape:"dot",text:"nodered.status.requesting"});
                            msg.token = token;
                            node.send(msg);
                            return;

                            token = token.token_type+' '+token.access_token;
                            var options = {
                                headers: {
                                    "Authorization": token,
                                    // "Node-RED-Deployment-Type":"reload"
                                }
                            }

                            pipeline(
                                fs.createReadStream('/local/nodered-nodes-noderedapi-0.1.0.tgz'),
                                got.stream.post(path,options),
                                new stream.PassThrough()
                            ).then((res) => {
                                node.trace("success");
                            }).catch((err) => {
                                node.error("failed");
                            });


                        }, (options, reason) => {
                            if (msg.token) {
                                delete msg.token;
                            }
                            msg.options = options;
                            msg.payload = reason;
                            node.send(msg);
                            node.error("Token failed");
                        }
                    );
                
                    break;
                case "Revoke":
                    break;
            }

            return;

        }

        node.on('input', function(msg, nodeSend, nodeDone) {
            node.auth(msg, nodeSend, nodeDone);
            //nodeSend(msg);
            nodeDone();
        });

    }
    RED.nodes.registerType("nodered-adminapi-auth", NodeREDAPIAuthNode);
}
