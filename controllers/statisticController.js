var Promise = require("bluebird");

var ProjectModel = require("../models/model").Project;
var CompanyModel = require("../models/model").Company;
var TrunkModel = require("../models/model").Trunk;

var RestController = require("./restController");
var StatisticController = new RestController(ProjectModel);

var resolver = require("../helpers/resolve");

var ObjectParse = {};

ObjectParse.Int = function(object){
	if(typeof object == "object"){
		for(var member in object){
			if(object.hasOwnProperty(member)){
				object[member] = ObjectParse.Int(object[member]);
			}
		}
		return object;
	} else {
		if(!isNaN(+object)){
			return +object;
		}
	}
}


StatisticController.getStatistic = function(conditions, fields, options, isAdmin, callback) {
	ObjectParse.Int(conditions);
	console.log(conditions);
	ProjectModel.aggregate(
	[	
		{
			$project:{
				dt : {$add: [new Date(0), "$startDate"]}
			}
		},
		{
			$project:{
				year : {$year: "$dt"},
				month : {$month: "$dt"}
			}
		},
		{
			$match : conditions
		},
		{
			$group:{
				_id: {
					year: "$year",
					month: "$month"
				},
				count: {$sum: 1}
			}
		},
		{
			$sort:{
			"_id.year": 1,
			"_id.month": 1
			}
		}
	], callback );
}

module.exports = StatisticController;
