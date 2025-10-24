"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withValidation = withValidation;
/**
 * Conditionally apply validation middleware in production.
 */
function withValidation(validator, handler, isProd) {
    return isProd ? [validator, handler] : [handler];
}
