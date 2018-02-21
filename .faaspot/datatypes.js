

module.exports.main = function main (event, context, callback) { 
    var data_types = ['number', 'integer', 'string', 'boolean', 'array', 'object', 'null'];
    var formats = ['date', 'date-time', 'uri', 'email', 'hostname', 'ipv4', 'ipv6', 'regex'];
    var response = JSON.stringify({'types': types});
    
    callback(null, {
        statusCode: 200,
        body: response,
        headers: {"Content-Type": "application/json"}
    });
};