// Defining the node program for the tiddlywiki-search user which uses an optional config node for server and creds
// Derived from core node https://github.com/node-red/node-red/blob/master/packages/node_modules/%40node-red/nodes/core/network/21-httprequest.js
// Author Robert Munnoch

const utility = require("./utility.js");

module.exports = function(RED) {
    "use strict";
    const got = require("got");
    const util = require("util");
    const promisify = util.promisify;
    const stream = require("stream");
    const fs = require("fs");

    // const formdata_node = require("formdata-node");
    // const FormData = formdata_node.FormData;


    const pipeline = promisify(stream.pipeline);

    function getservernode(node, config) {
        // If the nodered server config node is defined then use it other wise fall back to local information
        if (config.noderedserver) {
            node.log("Getting the server config node");
            node.server = RED.nodes.getNode(config.noderedserver)
            return true;
        }
        else {
            node.error(RED._("nodered.errors.no-server"));
            return false;
        }

    }

    function NodeREDAPIModuleNode(config) {
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

        // node.status({});

        node.status({fill:"blue",shape:"dot",text:"init"});

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

        node.upload = function(msg, nodeSend, nodeDone) {
            var preRequestTimestamp = process.hrtime();

            node.status({fill:"blue",shape:"dot",text:"nodered.status.requesting"});

            var path = `nodes`;
            var FormData = require('form-data');
            var options = {};
            if (node.config.moduletype == "File") {
                var form = new FormData();
                form.append('tarball', fs.createReadStream(node.config.modulename));
                options = {
                    prefixUrl: node.server.url,
                    path: "nodes",
                    // path: "uploadpretty",
                    method: "POST",
                    body: form
                    // form: {
                    //     tarball: fs.createReadStream('/local/nodered-nodes-noderedapi-0.1.0.tgz')
                    // },
                    // isstream: true
                }
            }
            else {
                options = {
                    prefixUrl: node.server.url,
                    path: "nodes",
                    // path: "uploadpretty",
                    method: "POST",
                    json: {
                        "module": node.config.modulename,
                    }
                }
            }

            if (msg.token) {
                node.error("token: " + JSON.stringify(msg.token));
                node.status({fill:"blue",shape:"dot",text:"nodered.status.got_token"});
                // node.status({fill:"blue",shape:"dot",text:"nodered.status.requesting"});
                token = msg.token.token_type+' '+msg.token.access_token;
                options.headers = {
                    "Authorization": token,
                    // "Node-RED-Deployment-Type":"reload"
                }
            } else {
            }
            
            // try {
            //     const response = await got.stream(options);
            //     console.log('statusCode:', response.statusCode);
            //     console.log('body:', response.body);
            // } catch (error) {
            //     console.log('error:', error);
            // }
            got(options).then((res, err) => {
                node.error(err);
                node.error("Success: " + res.body);
                msg.payload = res.body;
                node.send(msg);
                msg.status = true;
            }, (error) => {
                //node.error(`Failed: ${error}, Statuscode: ${error.response.statusCode}, response: ${error.response.body}`);
                if (
                    error.response
                    && error.response.statusCode == 400
                    && error.response.body == '{"code":"module_already_loaded","message":"Module already loaded"}'
                ) {
                    // node.error(error);
                    node.error("Success but already loaded: " + error.response.body);
                    msg.payload = JSON.parse(error.response.body);
                    node.send(msg);
                    msg.status = true;
                }
                else {
                    throw error
                }
            }).catch((error) => {
                node.error(`Failed: ${error}`);
                if (error.response) {
                    node.error(`Statuscode: ${error.response.statusCode}, response: ${error.response.body}`);
                    msg.payload = JSON.parse(error.response.body);
                    msg.status = false;
                    node.send(msg);
                }
            });


            // pipeline(
            //     fs.createReadStream('/local/nodered-nodes-noderedapi-0.1.0.tgz'),
            //     got.stream.post(options),
            //     new stream.PassThrough()
            // ).then((res) => {
            //     node.error("Success: " + res.body);
            //     msg.payload = res.body;
            //     node.send(msg);
            // }).catch((err) => {
            //     node.error("Failed: " + err);
            // });
        }

        node.on('input', function(msg, nodeSend, nodeDone) {
            node.upload(msg, nodeSend, nodeDone);
            //nodeSend(msg);
            nodeDone();
        });

    }
    RED.nodes.registerType("nodered-adminapi-module", NodeREDAPIModuleNode);
}
