var distancss = require('../index.js'),
	Styleguide = distancss.Styleguide,
	Section = distancss.Section,
	Modifier = distancss.Modifier,

	path = require('path'),
	assert = require('assert'),

	styleDirectory = path.normalize(__dirname + '/fixtures-styles/'),
	common = require('./common.js')(styleDirectory);

suite('Modifier', function() {
	common.hasMethod(new Modifier({}), 'name');
	common.hasMethod(new Modifier({}), 'description');
	common.hasMethod(new Modifier({}), 'className');

	suite('#name', function() {
		common.testAllSections('should return data.name', '*.less|*.css', function(section) {
			var modifiers = section.modifiers(),
				i, l = modifiers.length;

			for (i = 0; i < l; i += 1) {
				assert.equal(modifiers[i].data.name, modifiers[i].name());
			}
		});
	});
	suite('#description', function() {
		common.testAllSections('should return data.description', '*.less|*.css', function(section) {
			var modifiers = section.modifiers(),
				i, l = modifiers.length;

			for (i = 0; i < l; i += 1) {
				assert.equal(modifiers[i].data.description, modifiers[i].description());
			}
		});
	});
	suite('#className', function() {
		common.testAllSections('should be valid CSS classes', '*.less|*.css', function(section) {
			var modifiers = section.modifiers(),
				i, l = modifiers.length;

			for (i = 0; i < l; i+= 1) {
				assert.ok(modifiers[i].className().match(/[a-z \-_]/gi));
			}
		});
	});

	suite('#markup', function() {
		common.testAllSections('should return a filtered data.section.markup', '*.less|*.css', function(section) {
			var modifiers = section.modifiers(),
				i, l = modifiers.length;

			for (i = 0; i < l; i += 1) {
				if (!modifiers[i].markup()) continue;

				assert.equal(section.data.markup, modifiers[i].data.section.data.markup);
				assert.equal(
					section.data.markup.replace(/\{\$modifiers\}/g, modifiers[i].className()),
					modifiers[i].markup().replace(/\{\$modifiers\}/g, '')
				);
			}
		});
	});
});
