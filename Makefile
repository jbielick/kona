TESTS = $$(find test/lib -name *.test.js)
EXCLUDE = bin/**
FIXTURES = test/fixtures

fixtures:
	mkdir -p $(FIXTURES)

clean:
	rm -rf ./$(FIXTURES)/testApp

test-app: clean | fixtures
	cd $(FIXTURES); \
	yo kona testApp --no-insight; \
	cd ../..

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

test-ci: test-app
	@NODE_ENV=test node --harmony \
		node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		--report lcovonly \
		-x $(EXCLUDE) \
		-- -u exports \
		$(TESTS) \
		--bail

.PHONY: test benchmark