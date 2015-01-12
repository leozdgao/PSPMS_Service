var resolver = require("../../helpers/resolve");

var chai = require("chai");
// chai.use(require("chai-as-promised"));

var expect = chai.expect;

describe("Resolver", function() {

	it("convert 1 level obj to normal embbed obj", function() {

		var testObj = {
			"conditions.name": "leo",
			"conditions.subjects.item": "thing"
		};

		expect(resolver.resolveObject(testObj)).to.deep.equal({ conditions:{ name: "leo", subjects: { item: "thing" } } });
	});

	it("convert normal embbed obj to 1 level obj", function() {

		var testObj = { 
			conditions: {
				name: "leo",
				subjects: { 
					item: "thing"
				}
			} 
		};

		expect(resolver.resolveString(testObj)).to.deep.equal({ "conditions.name": "leo", "conditions.subjects.item": "thing" });
	});
});