(function() {
    var StateGenerator;

    StateGenerator = (function() {
        var replaceRule = function(matched, stuff) {
            return ".pseudo-class-" + matched.replace(':', '');
        };

        function StateGenerator() {
            var idx, idxs, pseudos, replaceRule, rule, stylesheet, _i, _len, _len2, _ref, _ref2;
            pseudos = /(\:hover|\:disabled|\:active|\:visited|\:focus)/g;
            _ref = document.styleSheets;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                stylesheet = _ref[_i];
                idxs = [];
                _ref2 = stylesheet.cssRules || [];
                for (idx = 0, _len2 = _ref2.length; idx < _len2; idx++) {
                    rule = _ref2[idx];
                    if ((rule.type === CSSRule.STYLE_RULE) && pseudos.test(rule.selectorText)) {
                        this.insertRule(rule.cssText.replace(pseudos, replaceRule));
                    }
                }
            }
        }

        StateGenerator.prototype.insertRule = function(rule) {
            var headEl, styleEl;
            headEl = document.getElementsByTagName('head')[0];
            styleEl = document.createElement('style');
            styleEl.type = 'text/css';
            if (styleEl.styleSheet) {
                styleEl.styleSheet.cssText = rule;
            } else {
                styleEl.appendChild(document.createTextNode(rule));
            }
            return headEl.appendChild(styleEl);
        };

        return StateGenerator;
    }());

    new StateGenerator();

}).call(this);
