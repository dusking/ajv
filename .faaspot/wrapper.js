var crypto = require('crypto');
var basicAuth = require('basic-auth')
var assert = require('assert');
const rp = require('request-promise')
var Ajv = require('ajv');
// var normalise = require('ajv-error-messages');
const querystring = require('querystring');
const moment = require('moment');

var validateModule = require("./validate.js");

function normaliseErrorMessages(errors) {
    var fields = errors.reduce(
        function (acc, e) {
            var key = (e.dataPath.length == 0) ? e.keyword : e.dataPath.slice(1)            
            if (key in acc) {
                acc[key].push(e.message.toUpperCase()[0] + e.message.slice(1));
            }
            else {
                acc[key] = [e.message.toUpperCase()[0] + e.message.slice(1)];
            }            
            return acc;
        },
        {}
    );

    return fields;
}


function validateInput(body) {  
    console.log('Going to validate input..')

    var schema = {
        'required': ['schema'], 
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
            for (key in data) { 
                try {
                    data[key] = JSON.stringify(data[key]) 
                } catch (err) {
                    console.log(`error building input: ${err}`)
                }
            }
            var ajv = new Ajv({allErrors: true});
            var validator = ajv.compile(schema);
            var valid = data ? validator(data) : true;
            if (!valid) {                
                var normalisedErrors = normaliseErrorMessages(validator.errors);                        
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

function createDocKeyIfNeeded(userEntity, context) {
    // Spotinst Credentials
    var userId = userEntity.userId
	var account = 'act-5078b4ed'
	var token = '7b1e4e8d0916fd2a104acd92e37867977868b3cc674e9174871f02fb3476e6f2'
	var environment = context['environmentId']
    var key = userId
    var currentDate = moment(new Date()).format("YYYY-MM-DD");    
    var UserCounter = {start: currentDate, counter: 0};        
    
    var reqOptions = {
		uri:'https://api.spotinst.io/functions/environment/'+environment+'/userDocument',
		method: "POST",
		qs: {accountId: account},
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + token},	
		body: {
			"userDocument": {"key": key, "value": JSON.stringify(UserCounter)}
		},
		json:true
	}

    return new Promise(function (resolve, reject) {        
        if ('counter' in userEntity) {
            console.log('no need to create doc')    
            resolve(userEntity);         
        }
        else {
            console.log(`Going to create doc key: ${key} on: ${environment} with value: ${JSON.stringify(UserCounter)}`)            
            rp(reqOptions).then((res)=>{        
                console.log('doc key been created')    
                resolve({'userId': key, 'start': currentDate, 'counter': 0, 'elapsed': 0});         
            }).catch(err => {
                console.log('FAILED TO CREATE DOCUMENT: ' + err);
                reject(Error("Failed creating document, Access denied"));
            })   
        }             
    });
};

function updateDocKey(context, userEntity) {
    console.log('going to update key..')

	// Spotinst Credentials
	var account = 'act-5078b4ed'
	var token = '7b1e4e8d0916fd2a104acd92e37867977868b3cc674e9174871f02fb3476e6f2'
	var environment = context['environmentId']
    var key = userEntity['userId']  
    var UserCounter = {start: userEntity['start'], counter: parseInt(userEntity['counter']) + 1};  
	
    var reqOptions = {
		uri:'https://api.spotinst.io/functions/environment/'+environment+'/userDocument/'+key,
		method: "PUT",
		qs: {accountId: account},
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + token},	
		body: {
			"userDocument": {"value": JSON.stringify(UserCounter)}
		},
		json:true
	}

    return new Promise(function (resolve, reject) {
        console.log(`Going to update doc key: ${key} with value: ${JSON.stringify(UserCounter)}`)        
        rp(reqOptions).then((res)=>{            
            console.log('key updated')
            resolve({value: true});         
        }).catch((err)=>{
            console.log('FAILED: ' + err);
            reject(Error("Access denied"));
        })        
    });
};

function getDocValue(context, userTokenInfo) {
    // returns the user document
    // create it if not exists..
    return new Promise(function (resolve, reject) {
        var key = userTokenInfo['userId'].replace('-','')

        // var randomNum = Math.floor((Math.random() * 100000) + 1);
        // key = `${key}XX${randomNum}`

        console.log('goint to retrieve key: ' + key);
        context.getDoc(key, function(err, res) {
            if (res) {
                console.log('got doc key: ' + res)
                UserCounter = JSON.parse(res)                
                var startDate = moment(new Date(UserCounter.start)).format("YYYY-MM-DD");
                var currentDate = moment(new Date()).format("YYYY-MM-DD");
                var eladpsedDays = moment(currentDate).diff(startDate, 'days');
                resolve({'userId': key, 'start': UserCounter.start, 'counter': UserCounter.counter, 'elapsed': eladpsedDays});
            } else {
                console.log('Missing in document store: ' + key)
                resolve({'userId': key})
                // return createDocKey(context, key);
                // createDocKey(context, key).then(result => {
                //     resolve(result)
                // }).catch(err => {
                //     reject(err)
                // })
            }
        })
    })    
}


function getAsJson(data) {
    var jsonBody = data && data.trim()[0] == "{";
    if (!jsonBody) {
        console.log('data is not a json, but a query string parameters');
        var parsedQueryBody = querystring.parse(data)
        data = JSON.stringify(parsedQueryBody)
        console.log('data: ' + event.body)     
    } else {
        console.log('data is already a json: ' + data)     
    }
    return data
}


module.exports.mainValidateSchema = function mainValidateSchema(event, context, callback) {       
    console.log('event: ' + JSON.stringify(event))     
    console.log('context: ' + JSON.stringify(context))     
    console.log('body: ' + event.body)    

    var client_ip = event['headers']['X-Forwarded-For'];    
    event.body = getAsJson(event.body)

    authenticateUser(event, context)
    .then(userTokenInfo => getDocValue(context, userTokenInfo))    
    .then(userEntity => createDocKeyIfNeeded(userEntity, context))
    .then(userEntity => updateDocKey(context, userEntity))
    .then(results => validateInput(event.body))  
    .then(inputValidation => {  
        if (inputValidation['errors']) {
            var response = JSON.stringify({'response': '', 'errors': inputValidation['errors']});
            callback(null, {
                statusCode: 400,
                body: response,
                headers: { "Content-Type": "application/json" }
            });    
        } else {
            callback(null, validateModule.validateSchema(event, context));
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


module.exports.main = function main(event, context, callback) {   
    console.log('event: ' + JSON.stringify(event))     
    console.log('context: ' + JSON.stringify(context))     
    console.log('body: ' + event.body)

    var client_ip = event['headers']['X-Forwarded-For'];
    event.body = getAsJson(event.body)

    authenticateUser(event, context)
    .then(userTokenInfo => getDocValue(context, userTokenInfo))    
    .then(userEntity => createDocKeyIfNeeded(userEntity, context))
    .then(userEntity => updateDocKey(context, userEntity))
    .then(results => validateInput(event.body))  
    .then(inputValidation => {  
        if (inputValidation['errors']) {
            var response = JSON.stringify({'response': '', 'errors': inputValidation['errors']});
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
