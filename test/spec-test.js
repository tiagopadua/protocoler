let tape = require('tape');

let Specification = require('../lib/spec.js');

const PROTOCOL_NAME = "Protocol Name";
const PROTOCOL_VERSION = "1.0";
const BYTE_ORDER = "BigEndian";
const REFERENCE = "https://url.for/documentation";
const FIELD_VERSION_NAME = "Protocol Version";
const FIELD_VERSION_SIZE = 1;
const VALUE1_DESCRIPTION = "Protocol Version 1";
const VALUE1_SPEC1_NAME = "Payload Size";
const VALUE1_SPEC1_SIZE = 2;
const VALUE1_SPEC2_NAME = "Payload Data";
const VALUE1_SPEC2_SIZE = "Payload Size";

TestSpec = {
    "name": PROTOCOL_NAME,
    "version": "1.0",
    "byteOrder": "BigEndian",  // possible values: "LittleEndian" or "BigEndian" (default "BigEndian")
    "reference": "https://url.for/documentation",
    "specList": [{
        "name": "Protocol Version",
        "size": 1,  // Bytes
        "values": {
            // Now list the possible values of this field. For each value, we may specify sub-fields
            "01": {
                "description": "Protocol Version 1",  // This value could be any string. Just using the version as an example
                // And here are the children specifications, which follows the same rules. This field is optional
                "specList": [{
                    "name": "Payload Size",
                    "size": 2,  // Again, in Bytes
                }, {
                    "name": "Payload Data",
                    "size": "Payload Size"  // IMPORTANT: if the size is a string, it is a reference for the value of the object with this name (in the same spec list)
                }]
            }
        }
    }]
};

tape('Test the most basic specification', test => {
    // Only a raw payload with 2 bytes:  0x1234
    let basicSpec = {
        "name": "Basic Name",
        "version": "1.0",
        "specList": [{
            "name": "Payload",
            "size": 2  // Bytes
        }]
    };

    let spec = null;

    test.doesNotThrow(() => { spec = new Specification(basicSpec); }, "Must create spec object without any exceptions");

    test.end();
});

tape('Test a single specification with all the features available, with several different levels', test => {
    // A spec full featured
    test.end();
});
