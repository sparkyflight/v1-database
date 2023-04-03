// Packages
const mongoose = require("mongoose");
const fs = require("fs");
const logger = require("./logger");
require("dotenv").config();

// Connect to MongoDB
let mongoDEV = null;

mongoose.set("strictQuery", true);

this.mongo = mongoose
	.connect(
		"mongodb+srv://select:PPA10082@nightmareproject.5en4i6u.mongodb.net/nightmarebot?retryWrites=true&w=majority"
	)
	.then(() => {
		logger.success("Production Database", "Connected!");

		mongoDEV = mongoose.createConnection(
			"mongodb+srv://select:PPA10082@nightmareproject.5en4i6u.mongodb.net/development?retryWrites=true&w=majority"
		);
	})
	.catch((err) => {
		logger.error("Production Database", `Failed to connect\nError: ${err}`);
	});

logger.success("Development Database", "Connected!");

// Schemas
const schemaFiles = fs
	.readdirSync("./database/schemas")
	.filter((file) => file.endsWith(".js"));
const prodSchemas = {};
const devSchemas = {};
const data = [];

setTimeout(async() => {
	// Import production schemas
	for (const fileName of schemaFiles) {
		const file = require(`./schemas/${fileName}`);
		prodSchemas[file.name] = mongoose.model(file.name, file.schema);
		devSchemas[file.name] = mongoDEV.model(file.name, file.schema);

		data.push({
			name: file.name,
            schema: file.schema.tree,
			data: await prodSchemas[file.name].find(),
		});
	}
}, 1000);

setTimeout(async() => {
	for (const doc of data) {
		console.log(doc.schema);
	}
}, 3000);
