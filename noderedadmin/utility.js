const got = require("got");

function isempty(obj) {
    // From https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    var empty = (
        obj
        && Object.keys(obj).length === 0
        && Object.getPrototypeOf(obj) === Object.prototype
    );
    return empty;
}

function getservernode(RED, node, config) {
    // If the nodered server config node is defined then use it other wise fall back to local information
    if (config.noderedserver) {
        node.trace("Getting the server config node");
        node.server = RED.nodes.getNode(config.noderedserver)
        return true;
    }
    else {
        node.error(RED._("nodered.errors.no-server"));
        return false;
    }
}

function tokenneeded(node, onResult, onFailure) {
    // setup request from https://nodered.org/docs/api/admin/methods/post/auth/token/
    var options = {
        prefixUrl: node.server.url,
        path: "/auth/login",
        method: "GET",
    };
    // ask for token
    got(options).then((res) => {
        node.trace("Login info: " + JSON.stringify(res.body));
        var auth = JSON.parse(res.body);
        var authreq = !isempty(auth);
        node.trace(`auth info: ${JSON.stringify(auth)}\n${authreq}`);

        if(onResult) {
            onResult(options, authreq, auth);
        }
    }).catch((reason) => {
        node.error("Failed to get login info: " + reason);
        if (onFailure) {
            onFailure(options, reason);
        }
    })
    
    // token = 'Bearer '+token.access_token;
    // msg.headers = {
    //     "Authorization": token,
    //     "Node-RED-Deployment-Type":"reload"
    // }
}

function gettoken(node, username, password, onToken, onNoToken) {
    // setup request from https://nodered.org/docs/api/admin/methods/post/auth/token/
    var reqbody = {
        client_id: "node-red-admin", // either this or "node-red-editor"
        grant_type: "password", // only password
        scope: "*", // must be either "*" or "read"
        username: username,
        password: password
    }
    var options = {
        prefixUrl: node.server.url,
        path: "auth/token",
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(reqbody)
    };
    // Request api for token
    got(options).then((res) => {
        // node.log("Get Token reply body: " + JSON.stringify(res.body));

        // parse token
        if (res.statusCode == 200) {
            token = JSON.parse(res.body);
            if (onToken) {
                onToken(token);
            }
        } else {
            throw `Token request failed: response ${res.statusCode} body: ${res.body}`
        }

    }).catch((reason) => {
        if (onNoToken) {
            onNoToken(options, reason);
        } else {
            node.error("Failed to get token: " + reason);
        }
    })
    
    // token = 'Bearer '+token.access_token;
    // msg.headers = {
    //     "Authorization": token,
    //     "Node-RED-Deployment-Type":"reload"
    // }
}


module.exports = {
    "isempty": isempty,
    "getservernode": getservernode,
    "tokenneeded": tokenneeded,
    "gettoken": gettoken,
}