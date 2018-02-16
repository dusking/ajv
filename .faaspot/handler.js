/*
 *
 * Implement your function here.
 * The function will get the request as a parameter with query/body properties:
 *    var queryparams = req.query;
 *    var body = req.body;
 *
 * The function should return a Promise that resolves with the following structure:
 *  resolve({
 *    statusCode: 200,
 *    body: '{"hello":"from NodeJS4.8 function"}',
 *    headers: {"Content-Type": "application/json"}
 *  })
 *
 */

var Ajv = require('ajv');

module.exports.main = function main (event, context, callback) {   
// function main (event, context, callback) {   
  body = event.body
  query = event.query

  console.log(`body: ${body}`);
  body = JSON.parse(body);
  schema = JSON.parse(body.schema);
  data = JSON.parse(body.data);

  console.log(`going to validate schema: ${schema} \nwith data: ${data}`);

  var ajv = new Ajv();

  try {
    var validate = ajv.compile(schema);
    var valid = validate(data);
    if (!valid) {
      console.log(validate.errors);
    } else {
      console.log('validated');
    }
  }
  catch(err) {
    console.log(err);
  }
  
  
  callback(null, {
              statusCode: 200,
              body: '{"hello":"from NodeJS8.3 function"}',
              headers: {"Content-Type": "application/json"}
      });
};

// console.log('hi')
// var body = JSON.stringify({
//   'schema': {   "properties": {     "foo": { "type": "string" },     "bar": { "type": "number", "maximum": 3 }   } },
//   'data': {"foo": "abc", "bar": 2}
// });
// var event = {'body': body, 'query': {}};
// function foo(a, b) {
//   console.log("Hello from foo!");
// }
// main(event, {}, foo);