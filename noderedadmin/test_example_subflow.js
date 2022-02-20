const fs = require("fs");
const path = require("path");

module.exports = function (RED) {
    const subflowFile = path.join(__dirname, "test_example_subflow.json");
    console.log(`subflowFile: ${subflowFile}`);
    const subflowContents = fs.readFileSync(subflowFile);
    console.log(`subflowFile length: ${subflowContents.length}`);
    const subflowJSON = JSON.parse(subflowContents);
    RED.nodes.registerSubflow(subflowJSON);
}