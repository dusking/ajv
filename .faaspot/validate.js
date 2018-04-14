var Ajv = require('ajv');
var jsonlint = require("jsonlint");


function getJson(jsonObj, paramName) {
    if (typeof jsonObj === 'object') {
        return jsonObj
    } else {
        try {
            return jsonlint.parse(jsonObj) ? JSON.parse(jsonObj) : null;
        } catch (err) {                
            throw {message: `failed to parse '${paramName}' json, ${err.message}`};
        }   
    }
}

function getYaml(yamlObj) {
    if (typeof yamlObj === 'object') {
        return yamlObj
    } else {        
        var YAML = require('yamljs');
        var yamlValidator = require('js-yaml');
        return yamlValidator.safeLoad(yamlObj) ? YAML.parse(yamlObj) : null;
    } 
}

function getSchema(body) {       
    var schema = body.schema;    
    var draft = body.draft;
    var bad_input = '';
    
    if (!schema) { 
        bad_input += "`schema`";
    }
    if (bad_input) {
        throw {message: `missing required parameters ${bad_input.trim()}`}
    }
    if (draft) {
        if (['4', '5', '6', '7'].indexOf(draft) < 0) {
            throw {message: `schema draft can be one of: [4, 5, 6, 7]`}
        }
    }
    if (typeof schema === "object" ) {            
        schema = JSON.stringify(schema)                         
    } 
    schema = schema.trim();        
    schema = getJson(schema, 'schema');         

    return {schema: schema, draft: draft};
}

function getSchemaData(body) {       
    var schema = body.schema;
    var data = body.data;
    var draft = body.draft;
    var bad_input = '';
    
    if (!schema) { 
        bad_input += "`schema`";
    }
    if (!data) { 
        var base = bad_input ? `${bad_input} and ` : '';
        bad_input = base + "`data`";
    }
    if (bad_input) {
        throw {message: `missing required parameters ${bad_input.trim()}`}
    }
    if (draft) {
        if (['4', '5', '6', '7'].indexOf(draft) < 0) {
            throw {message: `schema draft can be one of: [4, 5, 6, 7]`}
        }
    }

    // get `schema` parameter
    if (typeof schema === "object" ) {            
        schema = JSON.stringify(schema)                         
    } 
    schema = schema.trim();        
    schema = getJson(schema, 'schema');         

    // get `data` parameter
    if (typeof data === "object" ) {            
        data = JSON.stringify(data)                  
    }
    data = data.trim();
    data = getJson(data, 'data');      
    
    return {schema: schema, data: data, draft: draft};
}

function OLDgetSchemaData(body) {     
    try {
        var status = '';
        var schema = body.schema;
        var data = body.data;
        var schema_json_str = false;
        
        if (!schema) {
            status = 'bad input';
            throw {message: "missing required parameter `schema`"}
        }
        if (!data) {
            status = 'bad input';
            throw {message: "missing required parameter `data`"}
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
        return {error: `${status}, ${err.message}`}
    }    
    
    return {schema: schema, data: data};
}

function getSchemaUri(draft) {
    return `ajv/lib/refs/json-schema-draft-0${draft}.json`;    
}


function getAvjObj(draft) {
    // options, based on: https://github.com/epoberezkin/ajv#options    
    var options = {allErrors: true, schemaId: 'auto'};       

    if (draft == "4") {
        console.log('using draft: 4')
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
    } else if (draft == "5") {
        console.log('using draft: 5')
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
        console.log('using latest schema draft');
        var ajv = new Ajv(options);
    }
    return ajv;
}

function normaliseErrorMessages(errors_obj) {
    var errors = []
    errors_obj.forEach(function(element) {
        let message = '';        
        if (element.keyword == "required") {            
            message = element.message
        } else if (element.keyword == "type") {
            let key = element.dataPath.slice(1)
            message = `'${key}' argument ${element.message}`
        } else {
            let key = element.dataPath.slice(1)
            message = `'${key}' ${element.message}`
        }
        errors.push(message)
    });

    return errors;
}


module.exports.validateSchema = function validateSchema(event, context) { 
    var eventBody = event.body;
    var eventQuery = event.query;    
    var body = JSON.parse(eventBody);    
    var response = ''
    var errors = '';    
      
    try {        
        // retrieve the schema from the request        
        var req = getSchema(body);    
        var schema = req.schema;
        var draft = req.draft || "latest"
        console.log(`going to validate schema: ${JSON.stringify(schema)}, draft: ${draft}`);

        var ajv = getAvjObj(draft);  

        var valid = ajv.validateSchema(schema)

        // maybe if no data - just: ajv.validateSchema(schema)
        // var validator = ajv.getSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
        // console.log(`${typeof validator}`)
        // var validator = ajv.compile(schema);
        // var valid = validator(data);

        if (!valid) {
            console.log(validator.errors)            
            var normalisedErrors = normaliseErrorMessages(validator.errors);
            errors = normalisedErrors;
        }
    }
    catch (err) {        
        response = JSON.stringify({result: 'bad request', error: err.message});
        console.log(response);
        return {
            statusCode: 200,
            body: response,
            headers: { "Content-Type": "application/json" }
        };
    }

    if (errors) {
        response = JSON.stringify({result: 'data is invalid', validation_errors: errors});
    }    
    else {
        response = JSON.stringify({result: 'data is valid'});
    }
    console.log(response);
    return {
        statusCode: 200,
        body: response,
        headers: { "Content-Type": "application/json" }
    };
}


module.exports.validate = function validate(event, context) { 
    var eventBody = event.body;
    var eventQuery = event.query;    
    var body = JSON.parse(eventBody);    
    var response = ''
    var errors = '';    
      
    try {        
        // retrieve the schema from the request        
        var req = getSchemaData(body);    
        var schema = req.schema;
        var data = req.data;
        var draft = req.draft || "latest"
        console.log(`going to validate schema: ${JSON.stringify(schema)} \nwith data: ${JSON.stringify(data)}\draft: ${draft}`);

        var ajv = getAvjObj(draft);  

        // maybe if no data - just: ajv.validateSchema(schema)
        // var validator = ajv.getSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
        // console.log(`${typeof validator}`)
        var validator = ajv.compile(schema);
        var valid = validator(data);

        if (!valid) {
            console.log(validator.errors)            
            var normalisedErrors = normaliseErrorMessages(validator.errors);
            errors = normalisedErrors;
        }
    }
    catch (err) {        
        response = JSON.stringify({result: 'bad request', error: err.message});
        console.log(response);
        return {
            statusCode: 200,
            body: response,
            headers: { "Content-Type": "application/json" }
        };
    }

    if (errors) {
        response = JSON.stringify({result: 'data is invalid', validation_errors: errors});
    }    
    else {
        response = JSON.stringify({result: 'data is valid'});
    }
    console.log(response);
    return {
        statusCode: 200,
        body: response,
        headers: { "Content-Type": "application/json" }
    };
};