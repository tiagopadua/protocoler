REPORTER = spec

all: jshint test

test:
	./node_modules/.bin/tape test/**/*-test.js | ./node_modules/.bin/tap-spec

jshint:
	jshint lib examples test index.js

tests: test

tap:
	./node_modules/.bin/tape test/**/*-test.js > results.tap

.PHONY: test tap jshint
