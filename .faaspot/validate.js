var Ajv = require('ajv');
var YAML = require('yamljs');
var jsonlint = require("jsonlint");
var yamlValidator = require('js-yaml');
var normalise = require('ajv-error-messages');


function getJson(jsonObj) {
    if (typeof jsonObj === 'object') {
        return jsonObj
    } else {
        return jsonlint.parse(jsonObj) ? JSON.parse(jsonObj) : null;
    }
}

function getYaml(yamlObj) {
    if (typeof yamlObj === 'object') {
        return yamlObj
    } else {        
        return yamlValidator.safeLoad(yamlObj) ? YAML.parse(yamlObj) : null;
    } 
}

function getSchemaData(body) {     
    try {
        var status = '';
        var schema = body.schema;
        var data = body.data;
        var schema_json_str = false;
        
        if (!schema) {
            status = 'validate input';
            throw {message: "missing schema"}
        }
        if (!data) {
            status = 'validate input';
            throw {message: "missing data"}
        }

        if (typeof schema === "object" ) {            
            schema = JSON.stringify(schema)                         
        } 
        schema = schema.trim();        
        if (schema[0] == "{") {      
            schema_json_str = true;  
            status = 'input json schema';            
            schema = getJson(schema);            
        } else {
            status = 'input yaml schema';              
            schema = getYaml(chema)                 
        } 

        if (data) {            
            if (typeof data === "object" ) {            
                data = JSON.stringify(data)                  
            } 
            data = data.trim();        
            if (data[0] == "{") {                
                status = 'input json data';
                data = getJson(data);
            } else {                
                if (schema_json_str) {
                    // throw {message:"when schmea input is a json, need to use json data"}
                    throw {message: "invalid json data"}
                }
                status = 'input yaml data';              
                data = getYaml(data);                
            }      
        }          
    }  catch (err) {                
        return {error: `${status} - ${err.message}`}
    }    
    
    return {schema: schema, data: data};
}

function getSchemaUri(draft) {
    return `ajv/lib/refs/json-schema-draft-0${draft}.json`;    
}


function getAvjObj(version) {
    // options, based on: https://github.com/epoberezkin/ajv#options    
    var options = {allErrors: true, schemaId: 'auto'};       

    if (version == "4") {
        var ajv = new Ajv({
            schemaId: 'auto',
            meta: false, // optional, to prevent adding draft-06 meta-schema
            extendRefs: true, // optional, current default is to 'fail', spec behaviour is to 'ignore'
            unknownFormats: 'ignore',  // optional, current default is true (fail)
            // ...
          });
          
          var metaSchema = require('ajv/lib/refs/json-schema-draft-04.json');
          ajv.addMetaSchema(metaSchema);
          ajv._opts.defaultMeta = metaSchema.id;
          
          // optional, using unversioned URI is out of spec, see https://github.com/json-schema-org/json-schema-spec/issues/216
          ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';
          
          // Optionally you can also disable keywords defined in draft-06
          ajv.removeKeyword('propertyNames');
          ajv.removeKeyword('contains');
          ajv.removeKeyword('const');
    } else if (version == "5") {
        var ajv = new Ajv({
            schemaId: 'auto',
            $data: true,
            patternGroups: true,
            meta: false, // optional, to prevent adding draft-06 meta-schema
            extendRefs: true, // optional, current default is to 'fail', spec behaviour is to 'ignore'
            unknownFormats: 'ignore',  // optional, current default is true (fail)
            // ...
          });
          
          ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
          ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema'; // optional, using unversioned URI is out of spec
          var metaSchema = require('ajv/lib/refs/json-schema-v5.json');
          ajv.addMetaSchema(metaSchema);
          ajv._opts.defaultMeta = metaSchema.id;
          
          // optional - to avoid changing the schemas
          ajv.addKeyword('constant', { macro: x => ({ const: x }) }); // this keyword is renamed to const in draft-06
          // you need to use version "^2.0.0" of ajv-keywords
          require('ajv-keywords')(ajv, ['switch', 'patternRequired', 'formatMinimum', 'formatMaximum']);
          
          // Optionally you can also disable propertyNames keyword defined in draft-06
          ajv.removeKeyword('propertyNames');
    } else {
        console.log('using latest schema');
        var ajv = new Ajv(options);
    }
    return ajv;
}

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

module.exports.validate = function validate(event, context) { 
    var eventBody = event.body;
    var eventQuery = event.query;    
    var body = JSON.parse(eventBody);        

    // retrieve the schema from the request        
    var req = getSchemaData(body);    
    if (req.error) {
        let response = `Input validation faild: ${req.error}`;
        console.log(response)
        return {
            statusCode: 400,
            body: response,
            headers: { "Content-Type": "application/json" }
        };
    }
    
    var schema = req.schema;
    var data = req.data;
    var version = req.version || "latest"
    console.log(`going to validate schema: ${JSON.stringify(schema)} \nwith data: ${JSON.stringify(data)}\n`);

    var ajv = getAvjObj(version);
    var response = '';
    try {        
        // maybe if no data - just: ajv.validateSchema(schema)
        // var validator = ajv.getSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
        // console.log(`${typeof validator}`)
        var validator = ajv.compile(schema);        
    
        // if data wasn't supplied and schema compiled without exceptions - it's enougth (check the schema iteself)        
        // var valid = data ? validator(data) : true;
        var valid = validator(data);

        if (!valid) {
            console.log(validator.errors)
            // var normalisedErrors = normalise(validator.errors);
            var normalisedErrors = normaliseErrorMessages(validator.errors);
            response = 'Invalid. errors: ' + JSON.stringify(normalisedErrors);                        
        } else {            
            response = 'Validated';
        }
    }
    catch (err) {
        response = `Invalid schema. ${err.name}: ${err.message}`;
    }

    console.log(response);
    return {
        statusCode: 200,
        body: response,
        headers: { "Content-Type": "application/json" }
    };
};