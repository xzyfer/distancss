var Modifier;

/**
 * An instance of this class is returned on calling `Section.modifier`.
 * Exposes convenience methods for interpreting data.
 *
 * @param {Object} data A part of the data object passed on by `Section`.
 */
module.exports = Modifier = function (data) {
	if (!(this instanceof Modifier)) {
		return new Modifier();
	}
	this.data = data || {};
	this.data.markup = this.data.markup || '';
	this.init();
};

Modifier.prototype.init = function () {

};

Modifier.prototype.section = function() {
	return this.data.section;
};

Modifier.prototype.name = function() {
	return this.data.name;
};

Modifier.prototype.description = function() {
	return this.data.description;
};

Modifier.prototype.className = function() {
	var className = this.data.className;

	// Only get the first class combination -
	// Markup should not be multiple elements deep at this stage.
	className = className.split(/\s/);
	if (!className) {
		return false;
	}

	// Split into space-separated classes for inclusion
	// in templates etc.
	className = className[0]
		.replace(/\./g, ' ')
		.replace(/^\s*/g, '');

	return className;
};

Modifier.prototype.markup = function() {
	if (!(this.data.section && this.data.section.markup)) {
		return false;
	}

	return (this.data.section.markup() || '')
		.replace(/\{\$modifiers\}/g, this.className())
		.replace(/\{\$modifiers.name\}/g, this.name())
		.replace(/\{\$modifiers.value\}/g, this.description())
		;
};
