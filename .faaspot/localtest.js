var validateModule = require("./validate.js");

function test_bad_input_missing_data() {
    var jsonschema = '{"required": ["foo", "bar"], "properties":{"foo":{"type":"string"}, "bar":{"type":"number","maximum":3}}}';
    var jsondata = '{ "foo": "abc", "bar": 3 }';
    var body = JSON.stringify({
        'schema': jsonschema
    });
    var headers = {
        'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
    }
    var event = { 'body': body, 'query': {} , 'headers': headers};
    validateModule.validate(event, {});
}

function test_bad_input_missing_schema() {
    var jsonschema = '{"required": ["foo", "bar"], "properties":{"foo":{"type":"string"}, "bar":{"type":"number","maximum":3}}}';
    var jsondata = '{ "foo": "abc", "bar": 3 }';
    var body = JSON.stringify({
        'data': jsondata
    });
    var headers = {
        'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
    }
    var event = { 'body': body, 'query': {} , 'headers': headers};
    validateModule.validate(event, {});
}

function test_bad_input_missing_data_and_schema() {
    var jsonschema = '{"required": ["foo", "bar"], "properties":{"foo":{"type":"string"}, "bar":{"type":"number","maximum":3}}}';
    var jsondata = '{ "foo": "abc", "bar": 3 }';
    var body = JSON.stringify({        
    });
    var headers = {
        'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
    }
    var event = { 'body': body, 'query': {} , 'headers': headers};
    validateModule.validate(event, {});
}

function test_good_data() {
    var jsonschema = '{"required": ["foo", "bar"], "properties":{"foo":{"type":"string"}, "bar":{"type":"number","maximum":3}}}';
    var jsondata = '{ "foo": "abc", "bar": 3 }';
    var body = JSON.stringify({
        'schema': jsonschema,
        'data': jsondata        
    });
    var headers = {
        'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
    }
    var event = { 'body': body, 'query': {} , 'headers': headers};
    validateModule.validate(event, {});
}

function test_bad_data_missing_param() {
    var jsonschema = '{"required": ["foo", "bar"], "properties":{"foo":{"type":"string"}, "bar":{"type":"number","maximum":3}}}';
    var jsondata = '{"bar": 3 }';
    var body = JSON.stringify({
        'schema': jsonschema,
        'data': jsondata        
    });
    var headers = {
        'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
    }
    var event = { 'body': body, 'query': {} , 'headers': headers};
    validateModule.validate(event, {});
}

function test_bad_data_missing_multiple_params() {
    var jsonschema = '{"required": ["foo", "bar"], "properties":{"foo":{"type":"string"}, "bar":{"type":"number","maximum":3}}}';
    var jsondata = '{}';
    var body = JSON.stringify({
        'schema': jsonschema,
        'data': jsondata        
    });
    var headers = {
        'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
    }
    var event = { 'body': body, 'query': {} , 'headers': headers};
    validateModule.validate(event, {});
}

function test_bad_data_bad_type_param() {
    var jsonschema = '{"required": ["foo", "bar"], "properties":{"foo":{"type":"string"}, "bar":{"type":"number","maximum":3}}}';
    var jsondata = '{ "foo": 2, "bar": "3" }';
    var body = JSON.stringify({
        'schema': jsonschema,
        'data': jsondata        
    });
    var headers = {
        'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
    }
    var event = { 'body': body, 'query': {} , 'headers': headers};
    validateModule.validate(event, {});
}

function test_bad_schema() {
    var jsonschema = '{["foo", "bar"], "properties":{"foo":{"type":"string"}, "bar":{"type":"number","maximum":3}}}';
    var jsondata = '{ "foo": "abc", "bar": 3 }';
    var body = JSON.stringify({
        'schema': jsonschema,
        'data': jsondata        
    });
    var headers = {
        'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
    }
    var event = { 'body': body, 'query': {} , 'headers': headers};
    validateModule.validate(event, {});
}

test_bad_input_missing_data()
// test_bad_input_missing_schema()
// test_bad_input_missing_data_and_schema()
// test_good_data()
// test_bad_data_missing_param()
// test_bad_data_missing_multiple_params()
// test_bad_data_bad_type_param()
// test_bad_schema()