# Protocoler
An utility to parse binary protocols according to a JSON-formatted specification

# Protocol specification
The protocols are defined by a JSON schema.
The format of the JSON is as follows:
```
{
    "name": "Protocol Name",
    "version": "1.0",
    "reference": "https://url.for/documentation",
    "specList": [{
        "name": "Field Name",
        "size": 1,  // Bytes
        "values": {
            // Now list the possible values of this field. For each value, we may specify sub-fields
            "01": {
                "description": "Protocol Version",  // This value could be any string. Just using the version as an example
                // And here are the children specifications, which follows the same rules. This field is optional
                "specList": [{
                    "name": "Payload Size",
                    "size": 2,  // Again, in Bytes
                }, {
                    "name": "Payload Data",
                    "size": "Payload Size"
                    // IMPORTANT: if the size is a string, it is a reference for the value of the object with this name (in the same spec list)
                }]
            }
        }
    }, {
        "name": "Trailing value",
        "size": 1  // Again, in bytes
    }]
}
```

# Requirements
* ES6

# How to use
```
let capturedSample = '0x1234';  // As example
let Protocoler = require('protocoler');

let basicSpec = {
    "name": "Basic Name",
    "version": "1.0",
    "specList": [{
        "name": "Payload",
        "size": 2  // Bytes
    }]
};

let spec = new Protocoler(basicSpec);

spec.on('value', (name, value) => {
  console.log('Found protocol item:', name, value);
});
spec.on('description', description) {
  console.log('Last value means:', description);
});
spec.on('error', err => {
  console.error('Unable to parse input data', err);
});

// Now really start parsing the hexadecimal string
spec.parseHex(capturedSample);
```

# Current limitations (TODO's)
* We cannot parse bit-per-bit values yet. Only bytes.
* Values are currently only supported by hexadecimal values. (Cannot put even a string there, only a hex-representation of its bytes)
