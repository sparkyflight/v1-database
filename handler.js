// Packages
const mongoose = require("mongoose");
const fs = require("fs");
const logger = require("./logger");

// Connect to MongoDB
mongoose.set("strictQuery", true);

mongoose
	.connect(
		"mongodb+srv://select:PPA10082@nightmareproject.5en4i6u.mongodb.net/nightmarebot?retryWrites=true&w=majority"
	)
	.then(() => {
		logger.success("Database", "Connected!");
    })
	.catch((err) => {
		logger.error("Database", `Failed to connect\nError: ${err}`);
	});

// Schemas
const schemaFiles = fs
	.readdirSync("./database/schemas")
	.filter((file) => file.endsWith(".js"));
const schemas = {};

for (const fileName of schemaFiles) {
	const file = require(`./schemas/${fileName}`);
	schemas[file.name] = mongoose.model(file.name, file.schema);
};

// Users
class Users {
   static async create(data) {
       const doc = new schemas["user"](data);

       doc.save().then(() => {
	   logger.info("200", "MongoDB Document Created", {});
       }).catch((err) => {
           logger.error("400", `MongoDB Document Creation Error`, err);
       });
   }

   static async get(data) {
       const doc = schemas["user"].findOne(data);
       return doc;
   }

   static async find(data) {
       const doc = schemas["user"].find(data);
       return doc;
   }

   static async update(id, data) {
       schemas["user"].updateOne({
          UserID: id
       }, data, (err, doc) => {
          if (err) return err;
          if (doc) return true;
       });
   }

   static async delete(data) {
      return schemas["user"].deleteOne(data);
   }
};

// Tokens
class Tokens {
};

// Expose Functions
module.exports = {
    Users,
    Tokens
};
