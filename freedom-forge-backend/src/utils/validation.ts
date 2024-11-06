import { Status } from "oak";
import type { Context, Next } from "oak";
import type { State } from "@types/state.ts";
import { AppError } from "@utils/errors.ts";

export const validateRequest = async (
  ctx: Context<State>,
  next: Next,
): Promise<void> => {
  // Validate content type for POST/PUT/PATCH requests
  if (
    ['POST', 'PUT', 'PATCH'].includes(ctx.request.method) &&
    !ctx.request.headers.get('content-type')?.includes('application/json')
  ) {
    throw new AppError(
      Status.UnsupportedMediaType,
      'Content-Type must be application/json',
      'INVALID_CONTENT_TYPE',
    );
  }

  // Add more validation as needed
  await next();
};