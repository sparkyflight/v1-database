// Packages
const { exec } = require("child_process");
const fs = require("node:fs");
const logger = require("./logger");

// MongoURLs
const production = "mongodb+srv://select:PPA10082@nightmareproject.5en4i6u.mongodb.net/nightmarebot?retryWrites=true&w=majority";
const development = "mongodb+srv://select:PPA10082@nightmareproject.5en4i6u.mongodb.net/development?retryWrites=true&w=majority";

// Schemas
const schemaFiles = fs
	.readdirSync("./database/schemas")
	.filter((file) => file.endsWith(".js"));
const importCommands = [];
const exportCommands = [];

for (const fileName of schemaFiles) {
	const file = require(`./schemas/${fileName}`);
	
        importCommands.push({
           name: file.name,
           cmd: `mongoimport --url ${development} --collection ${file.name}s --type json --file ${file.name}s.json && rm -rf ${file.name}s.json`
        });

        exportCommands.push({
           name: file.name,
           cmd: `mongoexport --url ${production} --collection ${file.name}s --type json --out ${file.name}s.json`
        });
}

importCommands.forEach((i) => {
   console.log(i.cmd);
});

exportCommands.forEach((i) => {
   console.log(i.cmd);
});
