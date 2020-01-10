"use strict";

require("../__util__/test-init");

var path = require("path");
var autotest = require("../autotest");
var asyncTestSuite = require("../__util__/async-test-suite");
var createBrowserWithMarko = require("../__util__/create-marko-jsdom-module");

autotest("fixtures", run);
autotest("fixtures-deprecated", run);

/**
 * Builds a page with marko & lasso and then pipes it through jsdom, loading co-located tests.
 */
function run(fixture) {
    let resolve = fixture.resolve;
    asyncTestSuite(path.basename(fixture.dir), function() {
        var testFile = resolve("tests.js");
        var templateFile = resolve("template.marko");
        var template = require(templateFile);
        template = template.default || template;
        return template
            .render({})
            .then(function(result) {
                const html = result.toString();
                var browser = createBrowserWithMarko(__dirname, html, {
                    beforeParse(window, browser) {
                        browser.require("../../components");
                        browser.window.$initComponents();
                        browser.require(templateFile);
                    }
                });
                after(function() {
                    browser.window.close();
                });
                return browser;
            })
            .then(function(browser) {
                browser.window.document.close();
                browser.require(testFile);
            });
    });
}
