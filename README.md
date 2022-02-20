# nodered-nodes-noderedapi

Plan to build a Node admin API node set keeping it fairly basic. But will allow me to go meta... :D

NodeRED API - https://nodered.org/docs/api/admin/methods/

This is to take advantage of:

```bash
# Upload module
alias pushmod="curl -X POST --compressed -F tarball=@'nodered-nodes-noderedapi-0.1.0.tgz' 'http://localhost:1880/nodes'"

# Delete module
alias rmmod="curl 'http://localhost:30000/nodes/nodered-nodes-nodesapi' -X DELETE"
```

## Install

```bash
npm install munnox/nodered-nodes-tiddlywiki
```

Nodered Dependancies

```json
{
    "nodered-nodes-noderedapi": "github:munnox/nodered-nodes-noderedapi#dev",
}
```

## Develop and test:

```bash
# Build the package
npm build
# create a tgz which can then be upload to the nodred server
npm pack

# Test docker container commands
# Run a server to test the module on
npm run testserver
# Remove the test server
npm run testremove
# Reset test server
npm run testrestart
# Check logs
npm run testlogs
```

Flow for restarting the testing container:

```json
[
    {
        "id": "d03b06dca79b07c2",
        "type": "docker-container-actions",
        "z": "f6f2187d.f17ca8",
        "name": "",
        "config": "c9c6c72de657e1ee",
        "container": "mynodered",
        "action": "restart",
        "options": "",
        "x": 670,
        "y": 780,
        "wires": [
            [
                "79f08d36fc110d9f"
            ]
        ]
    },
    {
        "id": "3243c0bcccd896aa",
        "type": "inject",
        "z": "f6f2187d.f17ca8",
        "name": "",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 460,
        "y": 780,
        "wires": [
            [
                "d03b06dca79b07c2"
            ]
        ]
    },
    {
        "id": "79f08d36fc110d9f",
        "type": "debug",
        "z": "f6f2187d.f17ca8",
        "name": "",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 850,
        "y": 780,
        "wires": []
    },
    {
        "id": "c9c6c72de657e1ee",
        "type": "docker-configuration",
        "host": "/var/run/docker.sock",
        "port": ""
    }
]
```