// Defining the node program for the tiddlywiki-search user which uses an optional config node for server and creds
// Derived from core node https://github.com/node-red/node-red/blob/master/packages/node_modules/%40node-red/nodes/core/network/21-httprequest.js
// Author Robert Munnoch

const utility = require("./utility.js");


module.exports = function(RED) {
    "use strict";

    const sectionname = "adminapi";

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

        setTimeout(() => {node.status({fill:"gray",shape:"dot",text:"nodered.admin.initialised"})}, 0);

        node.check = function(msg, nodeSend, nodeDone) {
            utility.tokenneeded(node, (options, authreq, auth) => {
                node.status({fill:"green",shape:"dot",text:"nodered.admin.success"});
                // msg.options = options;
                msg[sectionname] = {
                    server: node.server.url,
                    options: options,
                    authorisation_required: authreq,
                    authorisation_info: auth,
                }
                node.send(msg);
                nodeDone();
            }, (options, reason) => {
                node.status({fill:"red",shape:"dot",text:"nodered.admin.failed"});
                if (msg[sectionname].authorisation_required) {
                    delete msg[sectionname].authorisation_required;
                }
                if (msg[sectionname].authorisation_info) {
                    delete msg[sectionname].authorisation_info;
                }
                msg[sectionname] = {
                    server: node.server.url,
                    options: options,
                    reason: reason,
                }
                node.send(msg);
                var error_message = `Failed to get token ${reason} with: ${JSON.stringify(options)}`;
                node.error(error_message);
                // throw error_message;
                nodeDone();
            })
        }

        node.get = function(msg, nodeSend, nodeDone) {
            utility.gettoken(
                node,
                node.server.credentials.username,
                node.server.credentials.password,
                (token) => {
                    node.trace("token" + JSON.stringify(token));
                    node.status({fill:"green",shape:"dot",text:"nodered.admin.success"});
                    // node.status({fill:"blue",shape:"dot",text:"nodered.status.requesting"});
                    msg[sectionname] = {
                        token: token,
                    };
                    node.send(msg);
                    nodeDone();
                }, (options, reason) => {
                    node.status({fill:"red",shape:"dot",text:"nodered.admin.failed"});
                    if (msg[sectionname].token) {
                        delete msg[sectionname].token;
                    }
                    msg[sectionname] = {
                        server: node.server.url,
                        options: options,
                        reason: reason,
                    }
                    node.send(msg);
                    var error_message = `Failed to get token ${reason} with: ${JSON.stringify(options)}`;
                    node.error(error_message);
                    // throw error_message;
                    nodeDone();
                }
            );
        }

        node.revoke = function(msg, nodeSend, nodeDone) {
            throw "Revoke not implemented yet.";
        }

        node.on('input', function(msg, nodeSend, nodeDone) {
            var preRequestTimestamp = process.hrtime();
            node.status({fill:"blue",shape:"dot",text:"nodered.admin.requesting"});

            switch (node.config.function) {
                case "Check":
                    node.check(msg,nodeSend,nodeDone);
                    break;
                case "Get":
                    node.get(msg,nodeSend,nodeDone);
                    break;
                case "Revoke":
                    node.revoke(msg,nodeSend,nodeDone);
                    break;
            }
            
            //nodeSend(msg);
            // nodeDone();
        });

    }
    RED.nodes.registerType("nodered-adminapi-auth", NodeREDAPIAuthNode);
}
