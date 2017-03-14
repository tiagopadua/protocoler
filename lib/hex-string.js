let hexRegex = /^(0x){0,1}([a-fA-F0-9]+)$/;

class HexString {

	constructor(inputString) {
		if (typeof inputString !== 'string') {
			throw new Error('A single string parameter is required to create a new HexString instance.');
		}

		inputString = inputString.trim();  // Remove leading/trailing spaces

		let regexResult = hexRegex.exec(inputString);
		if (regexResult === null || !(regexResult instanceof Array) || regexResult.length < 3 || typeof regexResult[2] !== 'string') {
			throw new Error('The input string should be a valid string formatted in hexadecimal, according the regex ' + hexRegex.toString());
		}

		this.index = 0;  // Start at the beginning
		this.originalString = regexResult[2];  // Save only the interesting data, ignoring spaces and the "0x"
	}

	getNextBytes(bytes) {
		if (typeof bytes !== 'number' || bytes <= 0) {
			console.error('A single number parameter is required to get bytes from the HexString');
			return null;
		}

        let chars = bytes * 2;
        if ((this.index + chars) > this.originalString.length) {
            console.error('Unable to get next HexString value: original string is too small');
            console.error('Needed', chars, 'characters but only found', this.originalString.length - this.index);
            return null;
        }

        let result = this.originalString.substr(this.index, chars);
        this.index += chars;

        return result;
	}

	getRemainingBytes() {
		if (this.index >= this.originalString.length) {
			return null;
		}

		let result = this.originalString.substr(this.index);
		this.index = this.originalString.length;
		return result;
	}

}

module.exports = HexString;
