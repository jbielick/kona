TESTS = $$(find ./test -name *.test.js)
EXCLUDE = bin/**
FIXTURES = test/fixtures
TEST_APP = $(FIXTURES)/test-app
GLOBAL_KONA_BIN=$(npm -g bin)/kona

$(FIXTURES):
	mkdir -p $@

$(FIXTURES)/test-app:
	mkdir -p $@/node_modules
	cd $@; \
		npm link kona; \
		cd ..; \
		yo kona test-app --no-insight

clean:
	rm -rf ./$(FIXTURES)/test-app

test-app: link | $(FIXTURES)/test-app

$(GLOBAL_KONA_BIN):
	npm link

test: test-app
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--harmony \
		$(TESTS) \
		--bail

test-cov: test-app
	@NODE_ENV=test node --harmony \
		node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		-- -u exports \
		-x $(EXCLUDE) \
		$(TESTS) \
		--bail

test-ci: test-app
	@NODE_ENV=test node --harmony \
		node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		--report lcovonly \
		-x $(EXCLUDE) \
		-- -u exports \
		$(TESTS) \
		--bail

benchmark:
	@NODE_ENV=production ./benchmark/simple

.PHONY: test benchmark link test-ci test-cov clean link