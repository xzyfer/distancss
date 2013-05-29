/*global suite, test, setup, teardown*/
var distancss = require('../index.js'),
	path = require('path'),
	walk = require('../lib/walk.js'),
	fs = require('fs'),
	marked = require('marked'),
	util = require('util'),
	Styleguide = distancss.Styleguide,
	Section = distancss.Section,
	Modifier = distancss.Modifier,
	styleDirectory = path.normalize(__dirname + '/fixtures-styles/'),
	assert = require('assert'),
	common = require('./common.js')(styleDirectory);

suite('Public Method/Class Check', function() {
	common.hasMethod(distancss, 'parse');
	common.hasMethod(distancss, 'traverse');
	common.hasMethod(distancss, 'Section');
	common.hasMethod(distancss, 'Modifier');
	common.hasMethod(distancss, 'Styleguide');
});

suite('#traverse', function() {
	suite('API/Validation Checks', function(done) {
		test('Should function with and without options', function(done) {
			distancss.traverse(styleDirectory, function(err, sga) {
				assert.ifError(err);
				distancss.traverse(styleDirectory, {}, function(err, sgb) {
					assert.ifError(err);
					// Need to find an alternative for this test.
					// At the moment it gets stuck asserting recursively.
					// assert.deepEqual(sga, sgb);
					done();
				});
			});
		});
		test('Should throw an error without a callback (for now)', function() {
			assert.throws(function() {
				distancss.traverse(styleDirectory, {});
			});
		});
	});
	suite('styleguide.data', function() {
		suite('.files:', function() {
			test('should reflect files found', function(done) {
				var maskAll = /.*/g;

				distancss.traverse(styleDirectory, { mask: maskAll }, function(err, styleguide) {
					assert.ok(styleguide.data);
					assert.ok(Array.isArray(styleguide.data.files));
					assert.ok(styleguide.data.files.length > 0);

					walk(styleDirectory, { mask: maskAll }, {
						file: function(file) {
							var i, l = styleguide.data.files.length, safe = false;
							file = file.replace(/\\/g, '/');
							assert.notEqual(styleguide.data.files.indexOf(file), -1);
						},
						finished: function(err) {
							assert.ifError(err);
							done();
						}
					});
				});
			});
		});
		suite('.body:', function() {
			test('is present, string', function(done) {
				distancss.traverse(styleDirectory, function(err, styleguide) {
					assert.ifError(err);
					assert.ok(!(styleguide.data.body instanceof Buffer));
					assert.equal(typeof styleguide.data.body, 'string');
					done();
				});
			});
			test('contains contents of all found files', function(done) {
				var maskAll = /.*/g, fileReader, fileCounter, sg;

				distancss.traverse(styleDirectory, function(err, styleguide) {
					var i, l;

					assert.ifError(err);
					assert.ok(!(styleguide.data.body instanceof Buffer));

					sg = styleguide;

					l = fileCounter = styleguide.data.files.length;
					for (i = 0; i < l; i += 1) {
						fs.readFile(styleguide.data.files[i], 'utf8', fileReader);
					}
				});

				fileReader = function(err, data) {
					fileCounter -= 1;

					assert.notEqual(sg.data.body.indexOf(data), -1);

					if (!fileCounter) {
						done();
					}
				};
			});
		});
		suite('.sections[]:', function() {
			suite('.raw', function() {
				setup(function(done) {
					var self = this;

					distancss.traverse(styleDirectory, function(err, styleguide) {
						assert.ifError(err);

						assert.ok(styleguide.data.sections);

						self.guide = styleguide;
						self.data = styleguide.data;
						done();
					});
				});

				test('each comment block in the array should be from .data.body (disregarding whitespace)', function() {
					var id, section, data = this.data,
						filteredBody = data.body
							.replace(/^[ ]*([*](?!\/))?/gm, '')
							.replace(/\/\/|\/\*+|\*+\/|\s/g, '');

					for (id in data.sections) {
						section = data.sections[id];
						assert.notEqual(filteredBody.indexOf(section.data.raw.replace(/\s/g, '')), -1);
					}
				});
			});
			suite('.description/.header', function() {
				common.testSection('3.2.1', 'sections-description.less', function(section) {
					assert.equal(section.data.header.toUpperCase(), 'ONE LINE, NO MODIFIERS');
					assert.equal(section.data.description.toUpperCase(), '');
				});

				common.testSection('3.2.2', 'sections-description.less', function(section) {
					assert.equal(section.data.header.toUpperCase(), 'ONE LINE, MULTIPLE MODIFIERS');
					assert.equal(section.data.description.toUpperCase(), '');
				});

				common.testSection('3.2.3', 'sections-description.less', function(section) {
					assert.equal(section.data.header.toUpperCase(), 'HEADER DETECTION');
					assert.equal(section.data.description.toUpperCase(), 'SEPARATE PARAGRAPH');
				});

				common.testSection('3.2.4', 'sections-description.less', function(section) {
					assert.equal(section.data.header.toUpperCase(), 'TWO PARAGRAPHS, MULTIPLE MODIFIERS');
					assert.equal(section.data.description.toUpperCase(), 'LIKE SO');
				});

				common.testSection('3.2.5', 'sections-description.less', function(section) {
					assert.equal(section.data.header.toUpperCase(), 'TWO LINES, MULTIPLE MODIFIERS LIKE SO');
					assert.equal(section.data.description.toUpperCase(), '');
				});
				common.testSection('3.2.6', 'sections-description.less', function(section) {
					assert.equal(section.data.header.toUpperCase(), 'THREE PARAGRAPHS, NO MODIFIERS');
					assert.equal(section.data.description.toUpperCase(), 'ANOTHER PARAGRAPH\n\nAND ANOTHER');
				});
			});
			suite('.modifiers', function() {
				common.testSection('3.1.1', 'sections-modifiers.less', function(section) {
					var modifiers = section.data.modifiers;
					assert.equal(modifiers.length, 0);
				});

				common.testSection('3.1.2', 'sections-modifiers.less', function(section) {
					var modifiers = section.data.modifiers;
					assert.equal(modifiers.length, 2);
					assert.equal(modifiers[0].data.name, ':hover');
					assert.equal(modifiers[0].data.description, 'HOVER');
					assert.equal(modifiers[1].data.name, ':disabled');
					assert.equal(modifiers[1].data.description, 'DISABLED');
				});

				common.testSection('3.1.3', 'sections-modifiers.less', function(section) {
					var modifiers = section.data.modifiers;
					assert.equal(modifiers.length, 2);
					assert.equal(modifiers[0].data.name, ':hover');
					assert.equal(modifiers[0].data.description, 'HOVER');
					assert.equal(modifiers[1].data.name, ':disabled');
					assert.equal(modifiers[1].data.description, 'DISABLED');
				});

				common.testSection('3.1.4', 'sections-modifiers.less', function(section) {
					var modifiers = section.data.modifiers;
					assert.equal(modifiers.length, 3);
					assert.equal(modifiers[0].data.name, '.red');
					assert.equal(modifiers[0].data.description, 'MAKE IT RED');
					assert.equal(modifiers[1].data.name, '.yellow');
					assert.equal(modifiers[1].data.description, 'MAKE IT YELLOW');
					assert.equal(modifiers[2].data.name, '.red.yellow');
					assert.equal(modifiers[2].data.description, 'MAKE IT ORANGE');
				});

				common.testSection('3.1.5', 'sections-modifiers.less', function(section) {
					var modifiers = section.data.modifiers;
					assert.equal(modifiers.length, 3);
					assert.equal(modifiers[0].data.name, 'a');
					assert.equal(modifiers[0].data.description, 'Contains the image replacement');
					assert.equal(modifiers[1].data.name, 'span');
					assert.equal(modifiers[1].data.description, 'Hidden');
					assert.equal(modifiers[2].data.name, 'a span');
					assert.equal(modifiers[2].data.description, 'Two elements');
				});

				common.testSection('3.1.6', 'sections-modifiers.less', function(section) {
					var modifiers = section.data.modifiers;
					assert.equal(modifiers.length, 5);
				});

				common.testSection('3.1.7', 'sections-modifiers.less', function(section) {
					var modifiers = section.data.modifiers;
					assert.equal(modifiers.length, 3);
					assert.equal(modifiers[0].data.name, '.red');
					assert.equal(modifiers[0].data.description, 'Color - red');
					assert.equal(modifiers[1].data.name, '.yellow');
					assert.equal(modifiers[1].data.description, 'Color  -  yellow');
					assert.equal(modifiers[2].data.name, '.blue');
					assert.equal(modifiers[2].data.description, 'Color - blue  -  another dash');
				});

				common.testSection('3.1.8', 'sections-modifiers.less', function(section) {
					var modifiers = section.data.modifiers;
					assert.equal(modifiers.length, 5);
				});

				common.testSection('3.2.1', 'sections-description.less', function(section) {
					var modifiers = section.data.modifiers;
					assert.equal(modifiers.length, 0);
				});

				common.testSection('3.2.4', 'sections-description.less', function(section) {
					var modifiers = section.data.modifiers;
					assert.equal(modifiers.length, 2);
				});

				common.testSection('3.2.5', 'sections-description.less', function(section) {
					var modifiers = section.data.modifiers;
					assert.equal(modifiers.length, 3);
				});

				common.testSection('3.2.6', 'sections-description.less', function(section) {
					var modifiers = section.data.modifiers;
					assert.equal(modifiers.length, 0);
				});

				suite('.data.className', function() {
					common.testAllSections('Convert pseudo-classes', '*.less|*.css', function(section) {
						var modifiers = section.data.modifiers,
							i, l = modifiers.length,
							currentData;

						for (i = 0; i < l; i += 1) {
							currentData = modifiers[i].data;
							assert.equal(
								currentData.name.replace(/\:/, '.pseudo-class-'),
								currentData.className
							);
						}
					});
				});
			});
			suite('.deprecated', function() {
				common.testSection('6.1', 'sections-status.less', function(section) {
					assert.ok(section.data.deprecated);
				}, 'Still works with vertical line space', { multiline: true});

				common.testSection('6.2', 'sections-status.less', function(section) {
					assert.ok(section.data.deprecated);
				}, 'Works when included in header', { multiline: true});

				common.testSection('6.3', 'sections-status.less', function(section) {
					assert.ok(section.data.deprecated);
				}, 'Works when included at the beginning of a paragraph', { multiline: true});

				common.testSection('6.4', 'sections-status.less', function(section) {
					assert.ok(!section.data.deprecated);
				}, 'Won\'t work when included in a modifier description', { multiline: true});

				common.testSection('6.5', 'sections-status.less', function(section) {
					assert.ok(!section.data.deprecated);
				}, 'Only works when included at the beginning of a paragraph/header', { multiline: true});
			});
			suite('.experimental', function() {

				common.testSection('6.6', 'sections-status.less', function(section) {
					assert.ok(section.data.experimental);
				}, 'Still works with vertical line space', { multiline: true});

				common.testSection('6.7', 'sections-status.less', function(section) {
					assert.ok(section.data.experimental);
				}, 'Works when included in header', { multiline: true});

				common.testSection('6.8', 'sections-status.less', function(section) {
					assert.ok(section.data.experimental);
				}, 'Works when included at the beginning of a paragraph', { multiline: true});

				common.testSection('6.9', 'sections-status.less', function(section) {
					assert.ok(!section.data.experimental);
				}, 'Won\'t work when included in a modifier description', { multiline: true});

				common.testSection('6.10', 'sections-status.less', function(section) {
					assert.ok(!section.data.experimental);
				}, 'Only works when included at the beginning of a paragraph/header', { multiline: true});
			});
			suite('.reference', function() {
				common.testSection('8', 'section-queries.less', function(section) {
					assert.equal(section.data.reference, '8');
				}, 'Sections labelled "X.0" should be equivalent to "X"', { multiline: true });
			});
		});
	});
	suite('options', function() {
		suite('.markup', function() {
			common.testSection('7.1', 'options-markup.less', function(section) {
				assert.equal(
					section.data.markup.toLowerCase(),
					'<a href="#" class="{$modifiers}">Hello World</a>'.toLowerCase()
				);

				assert.equal(section.data.reference, '7.1');
				assert.equal(section.data.modifiers.length, 3);
				assert.equal(section.data.description, '');
			}, false, { markup: true });

			common.testSection('7.2', 'options-markup.less', function(section) {
				assert.equal(
					section.data.markup.toLowerCase(),
					'<a href="#" class="{$modifiers}">Lorem Ipsum</a>'.toLowerCase()
				);
			});

			test('7.3', function(done) {
				distancss.traverse(styleDirectory, { markup: true }, function(err, styleguide) {
					var section = styleguide.section('7.3');

					assert.equal(section.data.reference, '7.3');
					assert.equal(section.data.header, 'Don\'t be the header');
					assert.equal(section.data.markup, '<h1 class="{$modifiers}">Header</h1>');
					assert.equal(section.data.modifiers[0].data.name, '.title');
					done();
				});
			});

			test('7.4', function(done) {
				distancss.traverse(styleDirectory, { markup: true }, function(err, styleguide) {
					var section = styleguide.section('7.4');
					var markup = ['<div class="{$modifiers}">', '    <h1>Header</h1>', '</div>'].join('\n');

					assert.equal(section.data.reference, '7.4');
					assert.equal(section.data.header, 'Should respect whitespace in comment blocks with preprocessor comments');
					assert.equal(section.data.markup, markup);
					done();
				});
			});

			test('7.5', function(done) {
				distancss.traverse(styleDirectory, { markup: true }, function(err, styleguide) {
					var section = styleguide.section('7.5');
					var markup = ['<div class="{$modifiers}">', '    <h1>Header</h1>', '</div>'].join('\n');

					assert.equal(section.data.reference, '7.5');
					assert.equal(section.data.header, 'Should respect whitespace in comment blocks with css docblocks');
					assert.equal(section.data.markup, markup);
					done();
				});
			});

			test('7.6', function(done) {
				distancss.traverse(styleDirectory, { markup: true }, function(err, styleguide) {
					var section = styleguide.section('7.6');
					var markup = ['<div class="{$modifiers}">', '    <h1>Header</h1>', '</div>'].join('\n');

					assert.equal(section.data.reference, '7.6');
					assert.equal(section.data.header, 'Should respect whitespace in comment blocks with multiline css comments');
					assert.equal(section.data.markup, markup);
					done();
				});
			});
		});
		suite('.mask:', function() {
			suite('Default', function() {
				common.shouldFindFile('style.css', {}, true);
				common.shouldFindFile('style.less', {}, true);
				common.shouldFindFile('style.stylus', {}, true);
				common.shouldFindFile('style.styl', {}, true);
				common.shouldFindFile('style.sass', {}, true);
				common.shouldFindFile('includes/buttons.less', {}, true);
				common.shouldFindFile('includes/buttons.js', {}, false);
			});
			suite('.js (regex)', function() {
				common.shouldFindFile('includes/buttons.js', { mask: /\.js/ }, true);
				common.shouldFindFile('includes/buttons.less', { mask: /\.js/ }, false);
				common.shouldFindFile('style.css', { mask: /\.js/ }, false);
			});
			suite('*.js (string)', function() {
				common.shouldFindFile('includes/buttons.js', { mask: '*.js' }, true);
				common.shouldFindFile('includes/buttons.less', { mask: '*.js' }, false);
				common.shouldFindFile('style.css', { mask: '*.js' }, false);
			});
			suite('.js|.less|.css (regex)', function() {
				common.shouldFindFile('includes/buttons.js', { mask: /\.js|\.less|\.css/ }, true);
				common.shouldFindFile('includes/buttons.less', { mask: /\.js|\.less|\.css/ }, true);
				common.shouldFindFile('style.css', { mask: /\.js|\.less|\.css/ }, true);
			});
			suite('*.js|*.less|*.css (string)', function() {
				common.shouldFindFile('includes/buttons.js', { mask: '*.js|*.less|*.css' }, true);
				common.shouldFindFile('includes/buttons.less', { mask: '*.js|*.less|*.css' }, true);
				common.shouldFindFile('style.css', { mask: '*.js|*.less|*.css' }, true);
			});
		});
		suite('.markdown', function() {
			common.testSection('3.2.6', 'sections-description.less', function(section) {
				assert.equal(section.data.description, marked('ANOTHER PARAGRAPH\n\nAND ANOTHER'));
			}, 'Formats when enabled', { markdown : true });
			common.testSection('3.2.6', 'sections-description.less', function(section) {
				assert.equal(section.data.description, 'ANOTHER PARAGRAPH\n\nAND ANOTHER');
			}, 'Doesn\'t format when disabled', { markdown : false });
			common.testSection('3.2.6', 'sections-description.less', function(section) {
				assert.equal(section.data.description, 'ANOTHER PARAGRAPH\n\nAND ANOTHER');
			}, 'Disabled by default');
		});
		suite('.multiline (disabled)', function() {
			common.testSection('3.2.1', 'sections-description.less', function(section) {
				assert.ok(section.data.description.toUpperCase(), 'ONE LINE, NO MODIFIERS');
			}, false, { multiline: false });

			common.testSection('3.2.2', 'sections-description.less', function(section) {
				assert.equal(section.data.description.toUpperCase(), 'ONE LINE, MULTIPLE MODIFIERS');
			}, false, { multiline: false });

			common.testSection('3.2.3', 'sections-description.less', function(section) {
				assert.equal(section.data.description.toUpperCase(), 'HEADER DETECTION\n\nSEPARATE PARAGRAPH');
			}, false, { multiline: false });

			common.testSection('3.2.4', 'sections-description.less', function(section) {
				assert.equal(section.data.description.toUpperCase(), 'TWO PARAGRAPHS, MULTIPLE MODIFIERS\n\nLIKE SO');
			}, false, { multiline: false });

			common.testSection('3.2.5', 'sections-description.less', function(section) {
				assert.equal(section.data.description.toUpperCase(), 'TWO LINES, MULTIPLE MODIFIERS\nLIKE SO');
			}, false, { multiline: false });
			common.testSection('3.2.6', 'sections-description.less', function(section) {
				assert.equal(section.data.description.toUpperCase(), 'THREE PARAGRAPHS, NO MODIFIERS\n\nANOTHER PARAGRAPH\n\nAND ANOTHER');
			}, false, { multiline: false });
		});
	});
});
