"use strict";

var GrammarError = require("../../grammar-error");
var visitor = require("../visitor");

// Checks that each label is defined only once within each scope.
function reportDuplicateLabels(ast) {
  function cloneEnv(env) {
    var clone = {};

    Object.keys(env).forEach(function (name) {
      clone[name] = env[name];
    });

    return clone;
  }

  function checkExpressionWithClonedEnv(node, env) {
    check(node.expression, cloneEnv(env));
  }

  var check = visitor.build({
    rule: function rule(node) {
      check(node.expression, {});
    },
    choice: function choice(node, env) {
      node.alternatives.forEach(function (alternative) {
        check(alternative, cloneEnv(env));
      });
    },


    action: checkExpressionWithClonedEnv,

    labeled: function labeled(node, env) {
      if (Object.prototype.hasOwnProperty.call(env, node.label)) {
        throw new GrammarError("Label \"" + node.label + "\" is already defined " + "at line " + env[node.label].start.line + ", " + "column " + env[node.label].start.column + ".", node.location);
      }

      check(node.expression, env);

      env[node.label] = node.location;
    },


    text: checkExpressionWithClonedEnv,
    simple_and: checkExpressionWithClonedEnv,
    simple_not: checkExpressionWithClonedEnv,
    optional: checkExpressionWithClonedEnv,
    zero_or_more: checkExpressionWithClonedEnv,
    one_or_more: checkExpressionWithClonedEnv,
    group: checkExpressionWithClonedEnv
  });

  check(ast);
}

module.exports = reportDuplicateLabels;