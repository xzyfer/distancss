module.exports = function(styleDirectory) {

	var testSection, shouldFindFile, testAllSections, hasMethod,
		distancss = require('../index.js'),
		assert = require('assert'),
		path = require('path'),
		fs = require('fs');

	testSection = function(reference, mask, testFunction, nameOverride, additionalOptions) {
		var key, options = {
			mask: mask,
			markdown: false
		};
		if (additionalOptions) {
			for (key in additionalOptions) {
				options[key] = additionalOptions[key];
			}
		}
		test(nameOverride || reference, function(done) {
			distancss.traverse(styleDirectory, options, function(err, styleguide) {
				var i, l = styleguide.data.sections.length,
					found = false;
				assert.ifError(err);

				if (reference !== 'all' && reference !== '*') {
					for (i = 0; i < l; i+= 1) {
						if (styleguide.data.sections[i].data.reference.toUpperCase() === reference.toUpperCase()) {
							assert.ok(styleguide.data.sections[i]);
							testFunction(styleguide.data.sections[i]);
							found = true;
						}
					}
					if (!found) {
						throw new Error("Couldn't find header: '"+reference+"'!");
					}
				} else {
					testFunction(styleguide.data.sections);
				}
				done();
			});
		});
	};

	testAllSections = function(name, mask, testFunction) {
		testSection('*', mask, function(sections) {
			var i, l = sections.length;

			for (i = 0; i < l; i += 1) {
				testFunction(sections[i]);
			}
		}, name);
	};

	shouldFindFile = function(file, options, shouldFind) {
		test(shouldFind? '"'+file+'"' : 'But not "'+ file+'"', function(done) {
			file = path.resolve(styleDirectory, file).replace(/\\/g, '/');
			distancss.traverse(styleDirectory, options || {}, function(err, styleguide) {
				assert.ifError(err);
				if (shouldFind) {
					assert.notEqual(styleguide.data.files.indexOf(file), -1);
				} else {
					assert.equal(styleguide.data.files.indexOf(file), -1);
				}
				done();
			});
		});
	};

	hasMethod = function(owner, method) {
		test('has method: '+method, function() {
			assert.ok(owner);
			assert.equal(typeof method, 'string');
			assert.equal(typeof owner[method], 'function');
		});
	};

	return {
		testSection: testSection,
		shouldFindFile: shouldFindFile,
		testAllSections: testAllSections,
		hasMethod: hasMethod
	};

};
