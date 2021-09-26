# nodered-nodes-noderedapi

Plan to build a Node admin API node set keeping it fairly basic. But will allow me to go meta... :D

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

## Develop and test:

```bash
# Build the package
npm build
# create a tgz which can then be upload to the nodred server
npm pack

# Alias
# Create a nodered server to test with
alias server="docker run -d -p 30000:1880 --name mynodered -v `pwd`/:/local/  nodered/node-red"
alias install="docker exec mynodered npm install /local/"
alias restart="docker restart mynodered"
# docker run -d -p 1880:1880 --name mynodered nodered/node-red

alias logs="docker logs -f mynodered"
alias remove="docker rm -f mynodered"
```