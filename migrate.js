// Packages
const { exec } = require("child_process");
const fs = require("node:fs");
const logger = require("./logger");
require("dotenv").config();

// MongoURLs
const production = `mongodb+srv://select:PPA10082@nightmareproject.5en4i6u.mongodb.net/${process.env.ENV === "production" ? "nightmarebot" : "development"}?retryWrites=true&w=majority`;
const development = `mongodb+srv://select:PPA10082@nightmareproject.5en4i6u.mongodb.net/${process.env.ENV === "production" ? "development" : "nightmarebot"}?retryWrites=true&w=majority`;

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
           cmd: `mongoimport --uri "${development}" --collection ${file.name}s --type json --file ${file.name}s.json && rm -rf ${file.name}s.json`
        });

        exportCommands.push({
           name: file.name,
           cmd: `mongoexport --uri "${production}" --collection ${file.name}s --type json --out ${file.name}s.json`
        });
}

exportCommands.forEach((i) => {
   exec(i.cmd, (error, stdout, stderr) => {
      if (error) return logger.error("Export Data", error.message);
      if (stderr) return logger.info("Export Data", stderr);

      return logger.info("Export Data", stdout);
   });
});

setTimeout(() => {
  importCommands.forEach((i) => {
     exec(i.cmd, (error, stdout, stderr) => {
       if (error) return logger.error("Import Data", error.message);
       if (stderr) return logger.info("Import Data", stderr);

       return logger.info("Import Data", stdout);
     });
  });
}, 3000);
