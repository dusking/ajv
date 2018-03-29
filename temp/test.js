const querystring = require('querystring');
var request = require('request');

var headers = {
	'Content-Type': 'application/json',
	'Token': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'
};

var body = {
	'data': {"foo": "abc", "bar": 3},
	'schema': {"required": ["foo", "bar"], "properties":{"foo":{"type":"string"}, "bar":{"type":"number","maximum":3}}}
};


var options = {
    url: 'https://faaspot.io/ajv/validate',
    method: 'POST',
    json: true,
    headers: headers,
    body: body
};

request(options, function (error, response, body) {
    if (error) {           
        console.log('error:', error); 
    }                            
    console.log('response:', body);    
})