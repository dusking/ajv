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

function test_draft_5() {
    var jsonschema = '{"required": ["foo", "bar"], "properties":{"foo":{"type":"string"}, "bar":{"type":"number","maximum":3}}}';
    var jsondata = '{ "foo": "abc", "bar": 3 }';
    var body = JSON.stringify({
        'schema': jsonschema,
        'data': jsondata,
        'draft': "5"     
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

function test_good_data_for_schema_4_bad_for_schema_6_testing_with_4() {
    var jsonschema6 = '{"type": "object", "description": "Any validation failures are shown in the right-hand Messages pane.", "properties": {"foo": {"type": "number"}, "bar": {"contains": {"type": "integer"}, "type": "array", "maxItems": 3}}}';
    var jsondata = '{ "foo": 12345, "bar": ["a", "b"] }';
    var body = JSON.stringify({
        'schema': jsonschema6,
        'data': jsondata,
        'draft': '4'    
    });
    var headers = {
        'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
    }
    var event = { 'body': body, 'query': {} , 'headers': headers};
    validateModule.validate(event, {});
}

function test_good_data_for_schema_4_bad_for_schema_6_testing_with_6() {
    var jsonschema6 = '{"type": "object", "description": "Any validation failures are shown in the right-hand Messages pane.", "properties": {"foo": {"type": "number"}, "bar": {"contains": {"type": "integer"}, "type": "array", "maxItems": 3}}}';
    var jsondata = '{ "foo": 12345, "bar": ["a", "b"] }';
    var body = JSON.stringify({
        'schema': jsonschema6,
        'data': jsondata,
        'draft': '6'    
    });
    var headers = {
        'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
    }
    var event = { 'body': body, 'query': {} , 'headers': headers};
    validateModule.validate(event, {});
}

function test_good_schema_version() {
    var jsonschema = '{"required": ["foo", "bar"], "properties":{"foo":{"type":"string"}, "bar":{"type":"number","maximum":3}}}';
    var jsonschema6 = '{"type": "object", "$schema": "http://json-schema.org/draft-04/schema#", "id": "http://json-schema.org/draft-04/schema#", "description": "validation", "properties": {"foo": {"type": "number"}, "bar": {"contains": {"type": "integer"}, "type": "array", "maxItems": 3}}}';
    var body = JSON.stringify({
        'schema': jsonschema6,
        'draft': '4'
    });
    var headers = {
        'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
    }
    var event = { 'body': body, 'query': {} , 'headers': headers};
    validateModule.validateSchema(event, {});
}

function test_bad_schema_version() {
    var jsonschema6 = '{"type": "object", "$schema": "http://json-schema.org/draft-04/schema#", "id": "http://json-schema.org/draft-04/schema#", "description": "validation", "properties": {"foo": {"type": "number"}, "bar": {"contains": {"type": "integer"}, "type": "array", "maxItems": 3}}}';
    var body = JSON.stringify({
        'schema': jsonschema6,
        'draft': '6'
    });
    var headers = {
        'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
    }
    var event = { 'body': body, 'query': {} , 'headers': headers};
    validateModule.validateSchema(event, {});
}

function test_bad_json_schema() {
    var jsonschema = '{"required" ["foo", "bar"], "properties":{"foo":{"type":"string"}, "bar":{"type":"number","maximum":3}}}';
    var body = JSON.stringify({
        'schema': jsonschema     
    });    
    var headers = {
        'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
    }
    var event = { 'body': body, 'query': {} , 'headers': headers};
    validateModule.validateSchema(event, {});
}

// function test_good_data_in_query() {
//     var jsonschema = '{"required": ["foo", "bar"], "properties":{"foo":{"type":"string"}, "bar":{"type":"number","maximum":3}}}';
//     var jsondata = '{ "foo": "abc", "bar": 3 }';
//     var body = 'data={"foo":"abc","bar":3}&schema={"required":["foo","bar"],"properties":{"foo":{"type":"string"},"bar":{"type":"number","maximum":3}}}'
//     var headers = {
//         'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'   ,
//         'Content-Type': 'text/plain' 
//     }
//     var event = { 'body': body, 'query': {} , 'headers': headers};
//     validateModule.validate(event, {});
// }

// test_bad_input_missing_data()
// test_bad_input_missing_schema()
// test_bad_input_missing_data_and_schema()
// test_good_data()
test_draft_5()
// test_bad_data_missing_param()
// test_bad_data_missing_multiple_params()
// test_bad_data_bad_type_param()
// test_bad_schema()
// test_good_data_for_schema_4_bad_for_schema_6_testing_with_4()
// test_good_data_for_schema_4_bad_for_schema_6_testing_with_6()

// test_good_schema_version()
// test_bad_schema_version()
// test_bad_json_schema()
