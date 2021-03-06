"use strict";

var GrammarError = require("../../grammar-error");
var asts = require("../asts");
var visitor = require("../visitor");

// Checks that all referenced rules exist.
function reportUndefinedRules(ast) {
  var check = visitor.build({
    rule_ref: function rule_ref(node) {
      if (!asts.findRule(ast, node.name)) {
        throw new GrammarError("Rule \"" + node.name + "\" is not defined.", node.location);
      }
    }
  });

  check(ast);
}

module.exports = reportUndefinedRules;