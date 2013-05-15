var Tag;

/**
 * An instance of this class is returned on calling `Section.tag`.
 * Exposes convenience methods for interpreting data.
 *
 * @param {Object} data A part of the data object passed on by `Section`.
 */
module.exports = Tag = function (data) {
	if (!(this instanceof Tag)) {
		return new Tag();
	}
	this.data = data || {};
	this.init();
};

Tag.prototype.init = function () {

};

Tag.prototype.section = function() {
	return this.data.section;
};

Tag.prototype.name = function() {
	return this.data.name;
};

Tag.prototype.value = function() {
	return this.data.value;
};
