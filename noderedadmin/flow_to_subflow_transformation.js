const fs = require("fs");
const path = require("path");

function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

module.exports = function (RED) {
    const subflowFile = path.join(__dirname, "flow_to_subflow_transformation.json");
    console.log(`subflowFile: ${subflowFile}`);
    const subflowContents = fs.readFileSync(subflowFile);
    console.log(`subflowFile length: ${subflowContents.length}`);
    var exportJSON = copy(JSON.parse(subflowContents));

    let subflows = [];

    // Extract subflow elements
    for (var i = 0; i < exportJSON.length; i++) {
        if (exportJSON[i].type == "subflow") {
            let subflow = copy(exportJSON[i]);
            // Define a flow property to fill in the next loop
            subflow.flow = [];
            subflows.push(subflow);
        }
    }
    // For the subflow elements find the flow elements
    // Use the Z property to find subflow element
    // that need to grouped within a flow.
    for (var i = 0; i < subflows.length; i++) {
        let subflow = subflows[i];
        for (var j = 0; j < exportJSON.length - 1; j++) {
            if (exportJSON[j].z == subflow.id) {
                let flow_element = copy(exportJSON[j]);
                subflow.flow.push(flow_element);
            }

        }
    }
    let subflowJSON = copy(subflows);

    //console.log(`Subflow transform: \n${JSON.stringify(subflowJSON, null, 2)}`)
    console.log(`Subflow transform: \n${subflowJSON.length}`)

    for (var i = 0; i < subflowJSON.length; i++) {
        RED.nodes.registerSubflow(subflowJSON[i]);
    }
}