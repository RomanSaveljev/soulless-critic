ifeq ($(TRAVIS_BUILD),)
  REPORTER ?= nyan
else
  REPORTER ?= tap
endif

MOCHA = ./node_modules/.bin/mocha

FILTER ?= .+

.PHONY: test-all cov-all

test-all:
	@NODE_ENV=test $(MOCHA) \
		--reporter $(REPORTER) --recursive -g '$(FILTER)'

cov-all:
	@NODE_ENV=test $(MOCHA) \
		--reporter html-cov --require blanket --recursive

travis-test:
	@NODE_ENV=test $(MOCHA) \
		--reporter travis-cov --require blanket --recursive
