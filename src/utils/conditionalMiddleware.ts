import { RequestHandler } from "express";

/**
 * Conditionally apply validation middleware in production.
 */
export function withValidation(
  validator: RequestHandler,
  handler: RequestHandler,
  isProd: boolean
): RequestHandler[] {
  return isProd ? [validator, handler] : [handler];
}
