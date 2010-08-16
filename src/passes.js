/*
 * Optimalization passes made on the grammar AST before compilation. Each pass
 * is a function that is passed the AST and returns a new AST. The AST can be
 * modified in-place by the pass. The passes are run in sequence in order of
 * their definition.
 */
PEG.compiler.passes = [
  /*
   * Removes proxy rules -- that is, rules that only delegate to other rule.
   */
  function(ast) {
    function isProxyRule(node) {
      return node.type === "rule" && node.expression.type === "rule_ref";
    }

    function replaceRuleRefs(ast, from, to) {
      function nop() {}

      function replaceInExpression(node, from, to) {
        replace(node.expression, from, to);
      }

      function replaceInSubnodes(propertyName) {
        return function(node, from, to) {
          each(node[propertyName], function(node) {
            replace(node, from, to);
          });
        };
      }

      var replaceFunctions = {
        grammar:
          function(node, from, to) {
            for (var name in node.rules) {
              replace(ast.rules[name], from, to);
            }
          },

        rule:         replaceInExpression,
        choice:       replaceInSubnodes("alternatives"),
        sequence:     replaceInSubnodes("elements"),
        labeled:      replaceInExpression,
        simple_and:   replaceInExpression,
        simple_not:   replaceInExpression,
        semantic_and: nop,
        semantic_not: nop,
        optional:     replaceInExpression,
        zero_or_more: replaceInExpression,
        one_or_more:  replaceInExpression,
        action:       replaceInExpression,

        rule_ref:
          function(node, from, to) {
            if (node.name === from) {
              node.name = to;
            }
          },

        literal:      nop,
        any:          nop,
        "class":      nop
      };

      function replace(node, from, to) {
        replaceFunctions[node.type](node, from, to);
      }

      replace(ast, from, to);
    }

    for (var name in ast.rules) {
      if (isProxyRule(ast.rules[name])) {
        replaceRuleRefs(ast, ast.rules[name].name, ast.rules[name].expression.name);
        if (name === ast.startRule) {
          ast.startRule = ast.rules[name].expression.name;
        }
        delete ast.rules[name];
      }
    }

    return ast;
  }
];
