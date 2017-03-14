REPORTER = spec

all: jshint test

test:
	./node_modules/.bin/tape test/**/*-test.js | ./node_modules/.bin/tap-spec

jshint:
	jshint lib examples test index.js

tests: test

tap:
	@NODE_ENV=test ./node_modules/.bin/tape > results.tap

.PHONY: test tap unit jshint skel
