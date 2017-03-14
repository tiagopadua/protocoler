let tape = require('tape');

let HexString = require('../lib/hex-string.js');

tape('Create a new HexString object with several inputs', test => {

    test.throws(() => { new HexString(); }, /Error:.+/i, 'Constructor should throw an error if no parameter is passed');
    test.throws(() => { new HexString(1); }, /Error:.+/i, 'Constructor should throw an error if a number is passed on the constructor');
    test.throws(() => { new HexString([]); }, /Error:.+/i, 'Constructor should throw an error if an array is passed on the constructor');
    test.throws(() => { new HexString({}); }, /Error:.+/i, 'Constructor should throw an error if a dictionary is passed on the constructor');
    test.throws(() => { new HexString(''); }, /Error:.+/i, 'Constructor should throw an error if an EMPTY string is passed on the constructor');
    test.throws(() => { new HexString('kkkkkkkk'); }, /Error:.+/i, 'Constructor should throw an error if an invalid hex string is passed on the constructor');

    test.doesNotThrow(() => { new HexString('abcdef'); }, 'Should accept lowercase a-f');
    test.doesNotThrow(() => { new HexString('ABCDEF'); }, 'Should accept uppercase A-F');
    test.doesNotThrow(() => { new HexString('0123456789'); }, 'Should accept numbers 0-9');
    test.doesNotThrow(() => { new HexString('0xaA0'); }, 'Should accept leading "0x"');
    test.doesNotThrow(() => { new HexString('  0x0123456789abcdefABCDEF    '); }, 'Should accept all valid characters + leading + trailing spaces');

    test.end();
});

tape('Retrieve sequential bytes', test => {

    let input = '0xaabbbbccc';
    let hs = null;

    test.doesNotThrow(() => { hs = new HexString(input); }, 'Should not throw an error creating object');

    // Test some invalid inputs
    test.equals(hs.getNextBytes(), null, 'Should return "null" with empty parameter');
    test.equals(hs.getNextBytes(0), null, 'Should return "null" for number 0');
    test.equals(hs.getNextBytes(-2), null, 'Should return "null" for negative numbers');
    test.equals(hs.getNextBytes('str'), null, 'Should return "null" for strings');
    test.equals(hs.getNextBytes([]), null, 'Should return "null" for Arrays');
    test.equals(hs.getNextBytes({}), null, 'Should return "null" for dictionaries');

    // Now for valid inputs
    test.equals(hs.getNextBytes(1), 'aa', 'Should return the next bytes');
    test.equals(hs.getNextBytes(2), 'bbbb', 'Should return the next bytes');
    test.equals(hs.getNextBytes(3), null, 'Should return "null" when the length of hex string is not enough for the informed bytes');
    test.equals(hs.getRemainingBytes(), 'ccc', 'Should return exactly the remaining bytes');
    test.equals(hs.getRemainingBytes(), null, 'Subsequent call to remaining bytes should return null');

    test.end();
});
