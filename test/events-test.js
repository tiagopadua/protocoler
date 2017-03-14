let tape = require('tape');

let EventEmitter = require('../lib/events.js');

tape('Add/remove event listener without being registered', test => {
	let eventName = 'eventName';

	let ev = new EventEmitter();
	test.false(ev.on(eventName, () => {}), 'Function "on" should return FALSE');
	test.false(ev.once(eventName, () => {}), 'Function "once" should return FALSE');
	test.false(ev.addEventListener(eventName, () => {}), 'Function "addEventListener" should return FALSE');
	test.false(ev.off(eventName, () => {}), 'Function "off" should return FALSE');
	test.false(ev.removeEventListener(eventName, () => {}), 'Function "off" should return FALSE');

	test.end();
});

tape('Add simple listener, receive a single event and remove the listener', test => {
	test.plan(6);

	let eventName = 'eventName';
	let eventParam = 'eventParam';

	function onEvent(param) {
		test.equal(param, eventParam, 'Event parameter received should be as expected');
	}

	let ev = new EventEmitter();
	test.true(ev._registerEvent(eventName), 'Should be able to register the event');
	test.true(ev.on(eventName, onEvent), 'Function "on" should return TRUE');
	test.true(ev.emit(eventName, eventParam), 'Function "emit" should return TRUE when emit is successful');
	test.true(ev.off(eventName, onEvent), 'Should be able to remove listener with result TRUE');
	test.true(ev.emit(eventName, eventParam), 'Function "emit" should return TRUE when emit is successful (even when there are no listeners)');
});
