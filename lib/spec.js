
/*
This class parse the JSON file


For example, let us have the following packet:  0x0105AABBCCDDEE
We can split this according to its structure:  01 - 05 - AABBCCDDEE
This packet has the following structure:
 01 - the protocol version
 05 - payload size
 AABBCCDDEE - payload data

Using this example, the JSON file for the specification looks like the following:

ProtocolSpecification = {
    "name": "Protocol Name",
    "version": "1.0",
    "byteOrder": "BigEndian",  // possible values: "LittleEndian" or "BigEndian" (default "BigEndian")
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
                    "size": "Payload Size"  // IMPORTANT: if the size is a string, it is a reference for the value of the object with this name (in the same spec list)
                }]
            }
        }
    }]
}

*/

let EError = require('./extendable-error.js');


const MAIN_KEYS = {
    'name': 'string',
    'version': 'string',
    'byteOrder': 'string',
    'reference': 'string',
    'specList': 'object'
};


class SpecError extends EError {}


class Spec {
    constructor(inputJSON) {
        this._specJSON = {};
        this._validateAndCopyJSON(inputJSON);
    }

    // Copy the JSON object, so we don't keep accessing an external object, which may change any time
    _validateAndCopyJSON(inputJSON) {
        if (typeof inputJSON === 'string') {
            inputJSON = JSON.parse(inputJSON);
        }

        if (typeof inputJSON !== 'object') {
            throw new SpecError('Expected JSON object for input, received ' + (typeof inputJSON));
        }

        for (let mainKey in inputJSON) {
            if (!inputJSON.hasOwnProperty(mainKey)) {
                continue;
            }
            if (!MAIN_KEYS.hasOwnProperty(mainKey)) {
                throw new SpecError('Key "' + mainKey + '" is not allowed, but was found in main protocol spec.');
            }

            let mainValue = inputJSON[mainKey];
            if (typeof mainValue !== MAIN_KEYS[mainKey]) {
                throw new SpecError('Key "' + mainKey + '" should be <' + MAIN_KEYS[mainKey] + '> but received <' + (typeof mainValue) + '>');
            }

            // All validated, so copy the field
            if (mainKey === 'specList') {
                // Create a new list to avoid data changed externally
                this._specJSON[mainKey] = [];
                this._validateAndCopySpecList(mainValue, this._specJSON[mainKey]);
            } else {
                this._specJSON[mainKey] = mainValue;
            }
        }
    }

    _validateAndCopySpecList(inputSpecList, localSpecList) {
        if (!(inputSpecList instanceof Array)) {
            throw new SpecError('Input Spec List shoud be an Array');
        }
        if (!(localSpecList instanceof Array)) {
            throw new SpecError('Local Spec List shoud be an Array');
        }

        let previousNameList = [];
        inputSpecList.every(singleSpec => {
            let localSingleSpec = {};
            localSpecList.push(localSingleSpec);
            this._validateAndCopySingleSpec(singleSpec, localSingleSpec, previousNameList);
            return true;  // Do not break the loop
        });
    }

    _validateAndCopySingleSpec(inputSingleSpec, localSingleSpec, previousNameList) {
        if (typeof inputSingleSpec !== 'object') {
            throw new SpecError('Input Single Spec should be an object. Received ' + (typeof inputSingleSpec));
        }
        if (typeof localSingleSpec !== 'object') {
            throw new SpecError('Local Single Spec should be an object. Received ' + (typeof localSingleSpec));
        }
        if (!(previousNameList instanceof Array)) {
            throw new SpecError('Previous names list should be an Array instance');
        }

        if (!inputSingleSpec.hasOwnProperty('name')) {
            throw new SpecError('Property "name" is mandatory in Input Single Spec, but it was not found.');
        }
        if (!inputSingleSpec.hasOwnProperty('size')) {
            throw new SpecError('Property "size" is mandatory in Input Single Spec, but it was not found.');
        }

        for (let key in inputSingleSpec) {
            if (!inputSingleSpec.hasOwnProperty(key)) {
                continue;
            }

            let value = inputSingleSpec[key];
            switch(key) {
                case 'name':
                    if (typeof value !== 'string') {
                        throw new SpecError('Parameter "name" in Input Single Spec should be a <string>. Received <' + (typeof value) + '>');
                    }
                    localSingleSpec[key] = value;
                    previousNameList.push(value);
                    break;
                case 'size':
                    if (typeof value !== 'string' && typeof value !== 'number') {
                        throw new SpecError('Parameter "size" in Input Single Spec should be <string> or <number>. Received <' + (typeof value) + '>');
                    }
                    // References should be already processed
                    if (typeof value === 'string' && !previousNameList.includes(value)) {
                        console.log(previousNameList);
                        throw new SpecError('Value "' + value + '" should be a reference to a previous names, but there are none with this name.');
                    }
                    localSingleSpec[key] = value;
                    break;
                case 'values':
                    localSingleSpec[key] = {};
                    this._validateAndCopySpecValues(value, localSingleSpec[key])
                    break;
                default:
                    throw new SpecError('Invalid key name (' + key + ') for Local Single Spec');
            }
        }
    }

    _validateAndCopySpecValues(inputValues, localValues) {
        if (typeof inputValues !== 'object') {
            throw new SpecError('Input Values should be an object. Received ' + (typeof inputValues));
        }
        if (typeof localValues !== 'object') {
            throw new SpecError('Local Values should be an object. Received ' + (typeof localValues));
        }

        for (let key in inputValues) {
            if (!inputValues.hasOwnProperty(key)) {
                continue;
            }

            let value = inputValues[key];
            localValues[key] = {};

            this._validateAndCopySingleSpecValue(key, value, localValues[key])
        }
    }

    _validateAndCopySingleSpecValue(valueKey, inputValue, localValue) {
        if (typeof inputValue !== 'object') {
            throw new SpecError('Value of "' + valueKey + '" should be an <object> but received <' + (typeof inputValue) + '>');
        }
        if (typeof localValue !== 'object') {
            throw new SpecError('Local value for key "' + valueKey + '" should be an <object> but received <' + (typeof localValue) + '>');
        }

        if (!inputValue.hasOwnProperty('description')) {
            throw new SpecError('The property "description" is mandatory for values - current key: ' + valueKey);
        }

        for (let key in inputValue) {
            if (!inputValue.hasOwnProperty(key)) {
                continue;
            }

            let value = inputValue[key];
            switch (key) {
                case 'description':
                    localValue[key] = value;
                    break;
                case 'specList':
                    localValue[key] = [];  // Create new object to avoid data changed externally
                    this._validateAndCopySpecList(value, localValue[key]);
                    break;
                default:
                    throw new SpecError('Invalid key for a spec value object: ' + key);
            }
        }
    }
}

module.exports = Spec;
