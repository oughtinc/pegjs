"use strict";

var GrammarError = require("../../grammar-error");
var asts = require("../asts");
var visitor = require("../visitor");

// Reports left recursion in the grammar, which prevents infinite recursion in
// the generated parser.
//
// Both direct and indirect recursion is detected. The pass also correctly
// reports cases like this:
//
//   start = "a"? start
//
// In general, if a rule reference can be reached without consuming any input,
// it can lead to left recursion.
function reportInfiniteRecursion(ast) {
  var visitedRules = [];

  var check = visitor.build({
    rule: function rule(node) {
      visitedRules.push(node.name);
      check(node.expression);
      visitedRules.pop(node.name);
    },
    sequence: function sequence(node) {
      node.elements.every(function (element) {
        check(element);

        return !asts.alwaysConsumesOnSuccess(ast, element);
      });
    },
    rule_ref: function rule_ref(node) {
      if (visitedRules.indexOf(node.name) !== -1) {
        visitedRules.push(node.name);

        throw new GrammarError("Possible infinite loop when parsing (left recursion: " + visitedRules.join(" -> ") + ").", node.location);
      }

      check(asts.findRule(ast, node.name));
    }
  });

  check(ast);
}

module.exports = reportInfiniteRecursion;