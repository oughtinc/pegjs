"use strict";

// Thrown when the grammar contains an error.

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GrammarError = function GrammarError(message, location) {
  _classCallCheck(this, GrammarError);

  this.name = "GrammarError";
  this.message = message;
  this.location = location;

  if (typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(this, GrammarError);
  }
};

module.exports = GrammarError;