const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	google_id: {
		type: String,
		required: true
	},
	username: {
    type: String,
    required: true,
		unique: false
	},
	favlist: {
		type : Array,
		"default" : []
	}

})

module.exports = mongoose.model('User', userSchema);
