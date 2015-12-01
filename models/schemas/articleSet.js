var Schema = require("mongoose").Schema;

var articleSetSchema = new Schema({
	_id: { type: Schema.Types.ObjectId, auto: true },
	name: { type: String, required: true },
	folders: [ Schema.Types.Mixed ],
	files: [ Schema.Types.ObjectId ]
}, { collection: "articleSets", versionKey: false });

module.exports = articleSetSchema;
