/**
 * An instance of this class is returned on calling `Styleguide.section`.
 * Exposes convenience methods for interpreting data.
 *
 * @param {Object} data A part of the data object passed on by `Styleguide`.
 */
module.exports = Section = function (data) {
    if (!(this instanceof Section)) {
        return new Section();
    }
    this.data = data || {};
    this.styleguide = data.styleguide || null;
    this.init();
};

Section.prototype.init = function () {
    var self = this;

    if (this.data.modifiers) {
        this.data.modifiers = this.data.modifiers.map(function(modifier) {
            modifier.data.section = self;
            return modifier;
        });
    }

    if (this.data.tags) {
        this.data.tags = this.data.tags.map(function(tag) {
            tag.data.section = self;
            return tag;
        });
    }
};

Section.prototype.header = function() {
    return this.data.header;
};

Section.prototype.description = function() {
    return this.data.description;
};

Section.prototype.firstModifier = function() {
    if (this.data.modifiers.length) {
        return this.data.modifiers[0];
    } else {
        return false;
    }
};

Section.prototype.deprecated = function() {
    return !!this.tags().filter(function(tag) {
        return tag.data.name.match(/deprecated/i);
    }).length;
};

Section.prototype.experimental = function() {
    return !!this.tags().filter(function(tag) {
        return tag.data.name.match(/experimental/i);
    }).length;
};

Section.prototype.reference = function() {
    return this.data.reference;
};

Section.prototype.markup = function() {
    return this.data.markup || false;
};

Section.prototype.modifiers = function(query) {
    var number, i, l;

    if (typeof query === 'string') {
        number = parseFloat(query, 10);

        // If can be converted to a number, convert and search
        // for the query by index (see below).
        if (number.toString() === query) {
            query = number;
        } else {
            // Otherwise, search for the modifier by name:
            l = this.data.modifiers.length;
            for (i = 0; i < l; i += 1) {
                if (this.data.modifiers[i].data.name === query) {
                    return this.data.modifiers[i];
                }
            }
            return false;
        }
    }

    if (typeof query === 'number') {
        return this.data.modifiers.length > query ? this.data.modifiers[query] : false;
    }

    return this.data.modifiers;
};

Section.prototype.tags = function(query) {
    var i, l;

    if (typeof query === 'string') {
        // Otherwise, search for the modifier by name:
        l = this.data.tags.length;
        for (i = 0; i < l; i += 1) {
            if (this.data.tags[i].data.name === query) {
                return this.data.tags[i];
            }
        }
        return false;
    }

    return this.data.tags;
};
