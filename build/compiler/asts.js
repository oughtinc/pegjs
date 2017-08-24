"use strict";

var visitor = require("./visitor");

// AST utilities.
var asts = {
  findRule: function findRule(ast, name) {
    for (var i = 0; i < ast.rules.length; i++) {
      if (ast.rules[i].name === name) {
        return ast.rules[i];
      }
    }

    return undefined;
  },
  indexOfRule: function indexOfRule(ast, name) {
    for (var i = 0; i < ast.rules.length; i++) {
      if (ast.rules[i].name === name) {
        return i;
      }
    }

    return -1;
  },
  alwaysConsumesOnSuccess: function alwaysConsumesOnSuccess(ast, node) {
    function consumesTrue() {
      return true;
    }
    function consumesFalse() {
      return false;
    }

    function consumesExpression(node) {
      return consumes(node.expression);
    }

    var consumes = visitor.build({
      rule: consumesExpression,
      named: consumesExpression,

      choice: function choice(node) {
        return node.alternatives.every(consumes);
      },


      action: consumesExpression,

      sequence: function sequence(node) {
        return node.elements.some(consumes);
      },


      labeled: consumesExpression,
      text: consumesExpression,
      simple_and: consumesFalse,
      simple_not: consumesFalse,
      optional: consumesFalse,
      zero_or_more: consumesFalse,
      one_or_more: consumesExpression,
      group: consumesExpression,
      semantic_and: consumesFalse,
      semantic_not: consumesFalse,

      rule_ref: function rule_ref(node) {
        return consumes(asts.findRule(ast, node.name));
      },
      literal: function literal(node) {
        return node.value !== "";
      },


      class: consumesTrue,
      any: consumesTrue
    });

    return consumes(node);
  }
};

module.exports = asts;