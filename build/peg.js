"use strict";

var GrammarError = require("./grammar-error");
var compiler = require("./compiler");
var parser = require("./parser");

var peg = {
  // PEG.js version (uses semantic versioning).
  VERSION: "0.10.0",

  GrammarError: GrammarError,
  parser: parser,
  compiler: compiler,

  // Generates a parser from a specified grammar and returns it.
  //
  // The grammar must be a string in the format described by the metagramar in
  // the parser.pegjs file.
  //
  // Throws |peg.parser.SyntaxError| if the grammar contains a syntax error or
  // |peg.GrammarError| if it contains a semantic error. Note that not all
  // errors are detected during the generation and some may protrude to the
  // generated parser and cause its malfunction.
  generate: function generate(grammar, options) {
    options = options !== undefined ? options : {};

    function convertPasses(passes) {
      var converted = {};

      Object.keys(passes).forEach(function (stage) {
        converted[stage] = Object.keys(passes[stage]).map(function (name) {
          return passes[stage][name];
        });
      });

      return converted;
    }

    var plugins = "plugins" in options ? options.plugins : [];
    var config = {
      parser: peg.parser,
      passes: convertPasses(peg.compiler.passes)
    };

    plugins.forEach(function (p) {
      p.use(config, options);
    });

    return peg.compiler.compile(config.parser.parse(grammar), config.passes, options);
  }
};

module.exports = peg;