let tape = require('tape');

let Specification = require('../lib/spec.js');

const PROTOCOL_NAME = "Protocol Name";
const PROTOCOL_VERSION = "1.0";
const BYTE_ORDER = "BigEndian";
const REFERENCE = "https://url.for/documentation";
const FIELD1_NAME = "Protocol Version";
const FIELD1_SIZE = 1;
const VALUE1_DESCRIPTION = "Protocol Version 1";
const VALUE1_SPEC1_NAME = "Payload";
const VALUE1_SPEC1_SIZE = 4;
const VALUE1_SUBVALUE1_DESCRIPTION = "Teste1";
const VALUE1_SUBVALUE2_DESCRIPTION = "Teste2";
const VALUE1_SUBVALUE3_DESCRIPTION = "Teste3";
const VALUE2_DESCRIPTION = "Protocol Version 2";
const VALUE2_SPEC1_NAME = "Payload Size";
const VALUE2_SPEC1_SIZE = 2;
const VALUE2_SPEC2_NAME = "Payload Data";
const VALUE2_SPEC2_SIZE = VALUE2_SPEC1_NAME;
const FIELD2_NAME = "Padding";
const FIELD2_SIZE = 1;

let fullSpec = {
    "name": PROTOCOL_NAME,
    "version": PROTOCOL_VERSION,
    "byteOrder": BYTE_ORDER,
    "reference": REFERENCE,
    "specList": [{
        "name": FIELD1_NAME,
        "size": FIELD1_SIZE,
        "values": {
            "01": {
                "description": VALUE1_DESCRIPTION,
                "specList": [{
                    "name": VALUE1_SPEC1_NAME,
                    "size": VALUE1_SPEC1_SIZE,
                    "values": {
                        "AABBCCDD": {
                            "description": VALUE1_SUBVALUE1_DESCRIPTION
                        },
                        "00112233": {
                            "description": VALUE1_SUBVALUE2_DESCRIPTION
                        },
                        "09090909": {
                            "description": VALUE1_SUBVALUE3_DESCRIPTION
                        }
                    }
                }]
            },
            "02": {
                "description": VALUE2_DESCRIPTION,
                "specList": [{
                    "name": VALUE2_SPEC1_NAME,
                    "size": VALUE2_SPEC1_SIZE,
                }, {
                    "name": VALUE2_SPEC2_NAME,
                    "size": VALUE2_SPEC2_SIZE
                }]
            }
        }
    }, {
        "name": FIELD2_NAME,
        "size": FIELD2_SIZE
    }]
};

tape('Test the most basic specification', test => {
    test.plan(3);

    // Only a raw payload with 2 bytes
    let basicPayload = '0x1234';
    let basicSpec = {
        "name": "Basic Name",
        "version": "1.0",
        "specList": [{
            "name": "Payload",
            "size": 2  // Bytes
        }]
    };

    test.doesNotThrow(() => {
        let spec = new Specification(basicSpec);

        // Register events
        spec.on('value', (name, value) => {
            test.equals(name, 'Payload', 'Spec name should be as expected');
            test.equals(value, '1234', 'Field value should be as expected');
        });
        spec.on('error', err => {
            test.fail('Basic spec should not emit error events');
        });
        spec.parseHex(basicPayload);
    }, "Must create spec object without any exceptions");
});

tape('Test a single specification with all the features available, in different levels', test => {
    test.plan(19);

    test.doesNotThrow(() => {
        let spec = new Specification(fullSpec);
        spec.on('value', (name, value) => {
            test.equals(typeof name, 'string', 'Field name should be a string');
            test.equals(typeof value, 'string', 'Field value should be a string');
            console.log(name, value);
        });
        spec.on('description', description => {
            console.log('desc', description);
            test.equals(typeof description, 'string', 'Description should be a string');
        });
        spec.on('error', err => {
            console.log('err', err);
            test.equals(typeof err, 'string', 'Error emitted should have a string description');
        });
        spec.parseHex('0x01AABBCCDD00');
        spec.parseHex('0x020001FF00');

        spec.parseHex('0x1');
    }, "Must create spec object without any exceptions");
});
