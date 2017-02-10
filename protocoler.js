'use strict';

(function (context) {

    let PRIVATE = {};

    context.Protocoler = class Protocoler {

        constructor() {
            this.hexString = '';
            this.currentHexStringIndex = 0;
            this.unitList = {};
            this.errorLogs = [];

            // Set up listeners
            this.listeners = new Map();
        }

        // Event emitter functions
        on(eventName, callback) {
            if (!this.listeners.has(eventName)) {
                this.logError('Unable to add listener. Event not recognized:', eventName);
                return false;
            }

            if (typeof callback !== 'function') {
                this.logError('Unable to add listener. Callback is not a function! Instead received:', typeof callback);
                return false;
            }

            let callbackList = this.listeners.get(eventName);
            let callbackFound = callbackList.every(callbackRegistered => callback === callbackRegistered); // Return false if callback is not exactly the same as one of the already registered
            if (callbackFound) {
                this.logError('Listener already added for the exact same callback. Skipping...');
                return false;
            }

            this.callbackList.push(callback);
            return true;
        }
        addEventListener(eventName, callback) {
            return this.on(eventName, callback);
        }

        off(eventName, callback) {
            if (!this.listeners.has(eventName)) {
                this.logError('Unable to remove listener. Event not recognized:', eventName);
                return false;
            }

            if (typeof callback !== 'function') {
                this.logError('Unable to remove listener. Callback is not a function! Instead received:', typeof callback);
                return false;
            }

            let callbackIndex = null;
            let callbackList = this.listeners.get(eventName);
            let callbackFound = callbackList.some((callbackRegistered, currentIndex) => {
                if (callback === callbackRegistered) {
                    callbackIndex = currentIndex;
                    return false; // Found! So, break
                }
                return true; // continue
            });
            if (!callbackFound || callbackIndex === null) {
                console.info('Listener not found, so will not remove it. Continue as is.');
            }

            this.callbackList.splice(callbackIndex, 1); // Remove it from the list
            return true;
        }

        // Save error messages
        logError() {
            let args = [].slice.apply(arguments);
            this.errorLogs.push(args);
            return console.error.apply(console, args);
        }

        getNextHexStringBytes(bytes) {
            let chars = bytes * 2;
            if ((this.currentHexStringIndex + chars) > this.hexString.length) {
                this.logError('Unable to get next value: input too small');
                let found = bytes - (((this.currentHexStringIndex + chars) - this.hexString.length) / 2);
                this.logError('Expected', bytes, 'bytes. Found only', found);
                return null;
            }

            let result = this.hexString.substr(this.currentHexStringIndex, chars);
            this.currentHexStringIndex += chars;

            return result;
        }

        getRemainingHexString() {
            if (this.currentHexStringIndex < this.hexString.length) {
                let remaining = this.hexString.substr(this.currentHexStringIndex);
                this.currentHexStringIndex = this.hexString.length;
                return remaining;
            }
            return null;
        }

        // Override this function
        onValueFound(name, value) {
            return;
        }

        // Override this function
        onDescriptionFound(description) {
            return;
        }

        // Override this function
        onError(remaining) {
            return;
        }

        // Returns true on success; false on failure
        parseSpecValues(specValues, currentValue) {
            if (!specValues) {
                // OK, values are not mandatory
                return true;
            }

            if (typeof specValues !== 'object') {
                this.logError('Invalid spec values: not an object', typeof specValues);
                return false;
            }

            for (let propertyName in specValues) {
                if (!specValues.hasOwnProperty(propertyName)) {
                    continue;
                }

                let value = specValues[propertyName];
                if (!value || typeof value !== 'object') {
                    this.logError('Unable to parse spec value', propertyName, value);
                    return false;
                }
                if (typeof value.description !== 'string') {
                    this.logError('Unable to parse spec value, description is not a string:', typeof value.description);
                    return false;
                }

                let type = 'hexnumber'; // Default type... this field is not mandatory
                if (value.hasOwnProperty('type')) {
                    if (typeof value.type !== 'string') {
                        this.logError('Unable to parse spec value, type is not valid', value.type)
                        return false;
                    }

                    type = value.type.toLowerCase();
                }

                let found = false;
                switch(type) {
                    case 'string':
                        found = (propertyName === currentValue);
                        break;

                    case 'hexnumber':
                        let intIndex = parseInt('0x' + propertyName);
                        let intValue = parseInt('0x' + currentValue);
                        if (typeof intIndex !== 'number' || isNaN(intIndex)) {
                            this.logError('Unable to parse spec value: value should be hex number but was not', propertyName);
                            return false;
                        }
                        if (typeof intValue !== 'number' || isNaN(intValue)) {
                            this.logError('Unable to parse spec value: value read in hexString should be hex number but was not', currentValue);
                            return false;
                        }
                        found = (intIndex === intValue);
                        break;

                    default:
                        this.logError('Unable to parse spec value, type is not valid', type);
                        return false;
                }

                if (found) {
                    this.onDescriptionFound(value.description);
                    return this.parseSpecList(value.specList);
                } else {
                    continue;
                }
            }

            this.logError('Unable to parse hex string: value not found');
            return false;
        }

        // Returns true on success; false on failure
        parseSingleSpec(spec) {
            if (typeof spec !== 'object' || !spec) {
                this.logError('Could not parse spec: invalid input');
                return false;
            }
            if (!spec.hasOwnProperty('name') || !spec.name || typeof spec.name !== 'string') {
                this.logError('Unable to parse spec: invalid name:', spec.name);
                return false;
            }

            let currentSize = null;
            if (!spec.hasOwnProperty('size')) {
                this.logError('Unable to parse spec: size not found');
                return false;
            } else if (typeof spec.size === 'number') {
                if (spec.size < 0) {
                    this.logError('Unable to parse spec: size is negative:', spec.size);
                    return false;
                } else if (!Number.isInteger(spec.size % 1)) {
                    this.logError('Unable to parse spec: size is not an integer:', spec.size);
                    return false;
                } else {
                    currentSize = spec.size;
                }
            } else if (typeof spec.size === 'string') {
                if (!this.sizes.hasOwnProperty(spec.size)) {
                    this.logError('Unable to parse spec: cannot find size named', spec.size);
                    return false;
                }

                let sizeString = '0x' + this.sizes[spec.size];
                currentSize = parseInt(sizeString);
                if (typeof currentSize === 'undefined' || currentSize === null || isNaN(currentSize)) {
                    this.logError('Unable to parse spec: size was found, but value was not an integer number: ', sizeString);
                    return false;
                }
            }

            let hexValue = this.getNextHexStringBytes(currentSize);
            if (!hexValue) {
                return false;
            }

            this.sizes[spec.name] = hexValue;

            // Finished validations, now really process
            this.onValueFound(spec.name, hexValue);

            return this.parseSpecValues(spec.values, hexValue);
        }

        // Returns true on success; false on failure
        parseSpecList(specList) {
            if (specList instanceof Array) {
                this.sizes = {};
                return !specList.some(currentSpec => {
                    return !this.parseSingleSpec(currentSpec);
                });
            }
            // Do nothing if specList is not an array
            this.logError('Spec List is not an Array');
            return false;
        }

        parseHexString(hexString) {
            if (typeof hexString !== 'string') {
                this.hexString = '';
                return this.logError('Unable to parse hex string, because input is not a string. ', typeof hexString);
            }

            let hexRegex = /^(0x)*([0-9a-f]+)$/i;
            let regexResult = hexRegex.exec(hexString);
            if (!regexResult) {
                this.hexString = '';
                return this.logError('Input string is not in hexadecimal format:', hexString);
            }

            // regexResult now contains a list:
            // [
            //   full match,
            //   first group,
            //   second group,
            // ]
            this.hexString = regexResult[2]; // Get only second group (excludes the "0x")

            console.debug('Rendering base HTML');
            let temp = document.createElement('template');
            temp.innerHTML = ejs.render(PRIVATE.templates.base, {
                uid: this.uid
            });
            document.body.appendChild(temp.content.firstChild);

            console.debug('Starting to process hex string', this.hexString);
            if (this.parseSpecList(PRIVATE.mainSpec.specList)) {
                let remaining = this.getRemainingHexString();
                if (remaining) {
                    this.logError('There is a remaining trash in the end:', remaining);
                    this.onError(remaining);
                }
            } else {
                this.onError(this.getRemainingHexString());
            }
        }

        parseBase64String(b64String) {
            // convert base64 string to hex string
            let hexString = convertBase64ToHexString(b64String);
            parseHexString(hexString);
        }

    };

})(this);

