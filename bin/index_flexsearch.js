const fs = require('fs');

const path = process.argv[1].replace(
    "index_flexsearch.js", "pkg-docs.json"
);
const packages = require(path);
console.log("Loaded " + packages.length + " packages.");

const { Index } = require("flexsearch");

var index = new Index({
    preset: "default",
    tokenize: "reverse",
    resolution: 9,
});

for (const [id, element] of packages.entries()) {
    const name = "name" in element ? element["name"] : element["key"];
    index.add(element["key"], name);
}

console.log(index.search("box"));

// index.export(function(key, data) {
//     fs.writeFileSync("flex_"+key+".json", JSON.stringify(data));
// });
