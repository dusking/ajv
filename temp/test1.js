var redis = require("redis");
var host = 'pub-redis-17762.eu-central-1-1.1.ec2.redislabs.com';
var port = 17762;
var db_name = 'faaspot';
var password = 'RYZb6VQuRNb8EgUVejHqq5fE0XRNFZoH';

client = redis.createClient({host: host, port: port, db: 0, password: password});

client.get("dusking:ajv", function (err, reply) {
    console.log(reply);
    res = JSON.parse(reply)
    console.log(res);
    client.end(true);
});