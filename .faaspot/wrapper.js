var crypto = require('crypto');
var basicAuth = require('basic-auth')
var assert = require('assert');
const rp = require('request-promise')
var Ajv = require('ajv');
var normalise = require('ajv-error-messages');
const querystring = require('querystring');

var validateModule = require("./validate.js");

function validateInput(body) {    
    var schema = {
        'required': ['schema', 'data'], 
        'properties': {
            'schema': {
                'description': 'The schema',
                'type': 'string',
                'minLength': 10,
                'maxLength': 1024
            },
            'data': {
                'description': 'The data to validate',
                'type': 'string',
                'minLength': 2,
                'maxLength': 1024
            }
        }}
    var data = JSON.parse(body);

    return new Promise(function (resolve, reject) {        
        try {               
            console.log('validating input schema: ' + JSON.stringify(schema))
            console.log('validating input data: ' + JSON.stringify(data))
            for (key in data) { 
                try {
                    data[key] = JSON.stringify(data[key]) 
                } catch (err) {
                    
                }        
            }
            var ajv = new Ajv({allErrors: true});
            var validator = ajv.compile(schema);
            var valid = data ? validator(data) : true;
            if (!valid) {
                console.log('11 input failed: ' + JSON.stringify(validator.errors))
                var normalisedErrors = normalise(validator.errors);        
                console.log('22 input failed: ' + JSON.stringify(normalisedErrors))
                var badFields = normalisedErrors['fields']
                resolve({errors: badFields});                                
            } else {            
                resolve({errors: null});                
            }
        } catch (err) {
            reject(Error(`Invalid input. ${err.name}: ${err.message}`));
        }        
    })
}

function decrypt(text){
    var algorithm = 'aes-256-ctr';
    var password = 'qM7Pjn6F';
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}

function authenticateUser(event, context) {    
    return new Promise(function (resolve, reject) {
        try {       
            var headers = event.headers                
            var auth = headers['Token'];
            console.log('Authorization encrypted token: ' + auth);
            encrypted_token = auth.replace(/^Basic /, '');    
            auth = "Basic " + decrypt(encrypted_token);
            console.log('Authorization decrypted token: ' + auth);
            var user = basicAuth.parse(auth);            
            console.log('Authorization decrypted user: ' + JSON.stringify(user));
            name = user['name']
            
            resolve({'userId': name});                 
        }
        catch(err) {     
            console.log('ERROR:', err);
            // reject(Error("Access denied"));
            resolve({'value': true});    
            done();             
        }
    });
}

function updateDocKey(context, userEntity) {
	// Spotinst Credentials
	var account = 'act-5078b4ed'
	var token = '7b1e4e8d0916fd2a104acd92e37867977868b3cc674e9174871f02fb3476e6f2'
	var environment = context['environmentId']
	var key = userEntity['userId']
	
    var putOptions = {
		uri:'https://api.spotinst.io/functions/environment/'+environment+'/userDocument/'+key,
		method: "PUT",
		qs: {accountId: account},
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + token},	
		body: {
			"userDocument": {
				"value": String(parseInt(userEntity['counter']) + 1)}
		},
		json:true
	}

    return new Promise(function (resolve, reject) {
        rp(putOptions).then((res)=>{
            console.log(res['response'])
            resolve({value: true});         
        }).catch((err)=>{
            console.log('FAILED: ' + err);
            reject(Error("Access denied"));
        })        
    });
};

function getDocValue(context, userTokenInfo) {
    return new Promise(function (resolve, reject) {
        var key = userTokenInfo['userId'].replace('-','')
        console.log('getDocValue ' + key);
        context.getDoc(key, function(err, res) {
            console.log('aaaa ' + res);
            console.log('bbbb ' + err);

            if (res) {
                resolve({'userId': key, 'counter': res});
            } else {
                reject(Error("It broke"));
            }
        })
    })    
}

module.exports.main = function main(event, context, callback) {   
    console.log('event: ' + JSON.stringify(event))     
    console.log('context: ' + JSON.stringify(context))     
  
    console.log('body: ' + event.body)
    console.log('>>>>>>>>>>>>>>> ' + typeof event.body)

    if (event.body && event.body.indexOf('&') > -1 ) {
        console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa');
        // req.body = JSON.parse(data);
        // convert body into json
        querystring.parse(event.body);
        var parsedQueryBody = querystring.parse(event.body)
        event.body = JSON.stringify(parsedQueryBody)
        console.log('event.body: ' + event.body)     
    }
    // if(str.indexOf(substr) > -1) {
    //     // convert body into json
    //     querystring.parse(event.body);
    //     var parsedQueryBody = querystring.parse(event.body)
    //     event.body = JSON.stringify(parsedQueryBody)
    //     console.log('event.body: ' + event.body)     
    // }

    authenticateUser(event, context)
    .then(userTokenInfo => getDocValue(context, userTokenInfo))    
    .then(userEntity => updateDocKey(context, userEntity))
    .then(results => validateInput(event.body))  
    .then(inputValidation => {  
        if (inputValidation['errors']) {
            var response = JSON.stringify(inputValidation['errors']);
            callback(null, {
                statusCode: 400,
                body: response,
                headers: { "Content-Type": "application/json" }
            });    
        } else {
            callback(null, validateModule.validate(event, context));              
        }        
    }).catch(err => {
        console.error('ERROR:', err);
        var response = JSON.stringify({'result': 'Failed to execute function.. :/'});
        callback(null, {
            statusCode: 200,
            body: response,
            headers: { "Content-Type": "application/json" }
        });
    })    
}



// var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
// var key = '00000000000000000000000000000000';
// var iv = '0000000000000000';
// var text = 'this-needs-to-be-encrypted';

// var cipher = crypto.createCipheriv(algorithm, key, iv);  
// var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
// console.log('encrypted', encrypted, encrypted.length)