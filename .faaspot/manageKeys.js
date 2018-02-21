

function getDocKey(event, context) {
	// Spotinst Credentials
	var account = 'act-5078b4ed'
	var token = '7b1e4e8d0916fd2a104acd92e37867977868b3cc674e9174871f02fb3476e6f2'
	var environment = 'env-b10b07f7'	
	var key = 'gh7295288'
	
    var getOptions = {
		uri:'https://api.spotinst.io/functions/environment/'+environment+'/userDocument/'+key,
		method: "GET",
		qs: {accountId: account},
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + token},	
		json:true
	}

	rp(getOptions).then((res)=>{
		console.log(res['response'])
	    callback(null, {
			statusCode: 200, 
			body: 'Success',
			headers: {"Content-Type": "application/json"}
		});
	}).catch((err)=>{
		console.log(err)
	    callback(null, {
			statusCode: 400, 
			body: 'Error. Check Logs',
			headers: {"Content-Type": "application/json"}
		});
	})
};

function setDocKey(event, context) {
	// Spotinst Credentials
	var account = 'act-5078b4ed'
	var token = '7b1e4e8d0916fd2a104acd92e37867977868b3cc674e9174871f02fb3476e6f2'
	var environment = 'env-b10b07f7'	
	var key = 'gh7295288'
	
    var postOptions = {
		uri:'https://api.spotinst.io/functions/environment/'+environment+'/userDocument'
		method: "GET",
		qs: {accountId: account},
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + token},	
		body: {
			"userDocument": {
				"key": YourKey,
				"value": YourValue}
		},
		json:true
	}

	rp(postOptions).then((res)=>{
		console.log(res['response'])
	    callback(null, {
			statusCode: 200, 
			body: 'Success',
			headers: {"Content-Type": "application/json"}
		});
	}).catch((err)=>{
		console.log(err)
	    callback(null, {
			statusCode: 400, 
			body: 'Error. Check Logs',
			headers: {"Content-Type": "application/json"}
		});
	})
};

function updateDocKey(event, context) {
	// Spotinst Credentials
	var account = 'act-5078b4ed'
	var token = '7b1e4e8d0916fd2a104acd92e37867977868b3cc674e9174871f02fb3476e6f2'
	var environment = 'env-b10b07f7'	
	var key = 'gh7295288'
	
    var postOptions = {
		uri:'https://api.spotinst.io/functions/environment/'+environment+'/userDocument/'+key,
		method: "GET",
		qs: {accountId: account},
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + token},	
		body: {
			"userDocument": {
				"value": YourValue}
		},
		json:true
	}

	rp(postOptions).then((res)=>{
		console.log(res['response'])
	    callback(null, {
			statusCode: 200, 
			body: 'Success',
			headers: {"Content-Type": "application/json"}
		});
	}).catch((err)=>{
		console.log(err)
	    callback(null, {
			statusCode: 400, 
			body: 'Error. Check Logs',
			headers: {"Content-Type": "application/json"}
		});
	})
};