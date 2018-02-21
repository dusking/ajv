
// TESTING
var validateModule = require("./validate.js");



var yamlschema = `
properties:
  foo:
    type: string
  bar:
    type: number
    maximum: 3
`;
var yamldata = `
foo: abc
bar: 3
`;
var jsonschema = '{"required": ["foo", "bar"], "properties":{"foo":{"type":"string"}, "bar":{"type":"number","maximum":3}}}';
var jsondata = '{ "foo": "abc", "bar": 3 }';


// "$schema": "http://json-schema.org/draft-04/schema#",
var jsonSchema6 = `
{    
    "description": "Any validation failures are shown in the right-hand Messages pane.",
    "type": "object",
    "properties": {
      "foo": {
        "type": "number"
      },
      "bar": {
        "type": "array",
        "maxItems": 3,
        "contains": { "type": "integer" }
      }
    }
  }
`
var jsonDataInvalid6 = `
{
    "foo": 12345,
    "bar": ["a", "b", 1]
}
`

var jsonSchema6b = `{
    "type": "object",     
    "properties": {
      "foo": {
        "type": "number"
      },
      "bar": {
        "const": "Must equal this value"
      },
      "baz": {
        "type": "object",
        "properties": {
          "staticProperty": {
            "type": "array",
            "contains": {
              "type": "number"
            }
          }
        },
        "propertyNames": {
          "pattern": "^([0-9a-zA-Z]*)$"
        },
        "additionalProperties": {
          "type": "string"
        }
      }
    }
  }
`
var dataInvalid6b = `{
    "foo": "Not a number",
    "bar": "Doesn't equal constant",
    "baz": {
      "staticProperty": [
        "This array needs at least one number"
      ],
      "property1": "The propertyNames keyword is an alternative to patternProperties",
      "prperty2": "All property names must match supplied conditions (in this case, it's a regex)"
    }
  }
`



var jsonSchema5 = `{
    "description": "Any validation failures are shown in the right-hand Messages pane.",
    "type": "object",
    "properties": {
      "foo": {
        "type": "number"
      },
      "moreThanFoo": {
        "type": "number",
        "minimum": {
          "$data": "1/foo"
        },
        "exclusiveMinimum": true
      },
      "bar": {
        "type": "string"
      },
      "sameAsBar": {
        "constant": {
          "$data": "1/bar"
        }
      },
      "baz": {
        "type": "object",
        "switch": [
          {
            "if": {
              "properties": {
                "foo": {
                  "constant": {
                    "$data": "2/foo"
                  }
                }
              },
              "required": [
                "foo"
              ]
            },
            "then": {
              "properties": {
                "foobaz": {
                  "type": "string"
                }
              },
              "required": [
                "foobaz"
              ]
            }
          },
          {
            "if": {
              "properties": {
                "bar": {
                  "constant": {
                    "$data": "2/bar"
                  }
                }
              },
              "required": [
                "bar"
              ]
            },
            "then": {
              "properties": {
                "barbaz": {
                  "type": "number"
                }
              },
              "required": [
                "barbaz"
              ]
            }
          },
          {
            "then": false
          }
        ]
      }
    }
  }
`

var dataInvalid5 = `{
    "foo": 12345,
    "moreThanFoo": 12344,
    "bar": "I love the constant keyword!",
    "sameAsBar": "I hate the constant keyword.",
    "baz": {
      "foo": 1234,
      "foobaz": "This is one of many ways to incorrectly format data with this switch schema."
    }
  }`

var body = JSON.stringify({
    'schema': yamlschema,
    'data': yamldata,
    'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
});
var headers = {
    'Authorization': 'Basic 62646018047677d2f204ffae7dac388bc4cb227d963b729d'    
}
var event = { 'body': body, 'query': {} , 'headers': headers};
function foo(a, b) {
    console.log(b);
}


validateModule.main(event, {}, foo)