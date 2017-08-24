"use strict";

var GrammarError = require("../../grammar-error");
var asts = require("../asts");
var visitor = require("../visitor");

// Reports expressions that don't consume any input inside |*| or |+| in the
// grammar, which prevents infinite loops in the generated parser.
function reportInfiniteRepetition(ast) {
  var check = visitor.build({
    zero_or_more: function zero_or_more(node) {
      if (!asts.alwaysConsumesOnSuccess(ast, node.expression)) {
        throw new GrammarError("Possible infinite loop when parsing (repetition used with an expression that may not consume any input).", node.location);
      }
    },
    one_or_more: function one_or_more(node) {
      if (!asts.alwaysConsumesOnSuccess(ast, node.expression)) {
        throw new GrammarError("Possible infinite loop when parsing (repetition used with an expression that may not consume any input).", node.location);
      }
    }
  });

  check(ast);
}

module.exports = reportInfiniteRepetition;