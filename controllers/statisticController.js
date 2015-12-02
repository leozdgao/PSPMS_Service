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
	conditions = ObjectParse.Int(conditions?conditions:{});
	ProjectModel.aggregate(
	[
		{
			$project:{
				// 在208上的project.startDate是毫秒数
				//dt : {$add: [new Date(0), "$startDate"]}
				// 在207上的project.startDate是日期型
				dt : "$startDate"
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
