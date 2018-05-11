// define a service using the framework for testing
var sf = require("bc_serviceframework");

// define a response wrapper
var SampleWrapper = {
	initFromWebservice : function(response){
		this.prop = response.value;
		return;
	},
	dummy : function(request){
		this.prop = "a dummy value";
		return;
	}
}

// define test service extending AbstractXMLBaseService
var SampleService = sf.getService('AbstractXMLBaseService').extend (
/** @lends ECBRateService.prototype */ 
{
	/**
	 * @constructs ECBRateService
	 * @augments AbstractHTTPService
	 */
	init : function() {
		this._super("SampleService", SampleWrapper); 	
		this.requestType = 'GET';
	},
	
	//Creates the request data - this is a required method - even if there is no request data 
	createRequest: function(){
		return null;
	}	
});

// The test cases
exports['Basic XML service construction and call - using target'] = function (test) {
    var service = new SampleService();

	test.notEqual(service, null,"SampleService cannot be created.");

	// simulate OK status & reponse
	service.serviceClient.statusCode = 200;
	// ... using a fake XML object
	service.serviceClient.text = {value : "a value"};
	//service.serviceClient.text = "<value>a value</value>";

    service.call();

	test.notEqual(service.status, null,"SampleService returns no status.");
	test.equal(service.status.code,'OK',"SampleService does not return status with code 'OK'.");

	test.notEqual(service.object, null,"SampleService object missing.");
	test.equal(service.object.prop,'a value',"SampleService object property not set to 'a value'.");


    test.done();
};

exports['Basic XML service construction and call - using DUMMY'] = function (test) {
    var service = new SampleService();
    
	test.notEqual(service, null,"SampleService cannot be created.");

    // simulate DUMMY credentials
    service.configuration.credentials.credentialsType = "DUMMY";

    service.call();

	test.notEqual(service.status, null,"SampleService returns no status.");
	test.equal(service.status.code,'OK',"SampleService does not return status with code 'OK'.");

	test.notEqual(service.object, null,"SampleService object missing.");
	test.equal(service.object.prop,'a dummy value',"SampleService object property not set to 'a dummy value'.");


    test.done();
};

exports['Basic XML service construction and call - using SYSTEM_UNAVAILABLE'] = function (test) {
    var service = new SampleService();
    
	test.notEqual(service, null,"SampleService cannot be created.");

    // simulate DUMMY credentials
    service.configuration.credentials.credentialsType = "SYSTEM_UNAVAILABLE";

    service.call();

	test.notEqual(service.status, null,"SampleService returns no status.");
	test.equal(service.status.code,'SYSTEM_UNAVAILABLE',"SampleService does not return status with code 'SYSTEM_UNAVAILABLE'.");

    test.done();
};