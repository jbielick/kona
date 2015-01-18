TESTS = $$(find test/lib -name *.test.js)
EXCLUDE = bin/**

clean:
	@NODE_ENV=test rm -rf ./test/fixtures/testApp

test-app: clean
	@cd test/fixtures && yo kona testApp && cd ../..

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--harmony \
		$(TESTS) \
		--bail

test-cov:
	@NODE_ENV=test node --harmony \
		node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		-- -u exports \
		-x $(EXCLUDE) \
		$(TESTS) \
		--bail

benchmark:
	@NODE_ENV=production ./benchmark/simple

test-travis:
	@NODE_ENV=test node --harmony \
		node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		--report lcovonly \
		-x $(EXCLUDE) \
		-- -u exports \
		$(TESTS) \
		--bail

.PHONY: test clean benchmark