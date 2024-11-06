import { Status } from "oak";
import { logger } from "@utils/logger.ts";
import type { Context } from "oak";
import type { State } from "@types/state.ts";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = async (
  ctx: Context<State>,
  next: () => Promise<unknown>,
): Promise<void> => {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      ctx.response.status = err.status;
      ctx.response.body = {
        status: 'error',
        message: err.message,
        code: err.code,
      };
    } else {
      logger.error('Unhandled error:', err);
      ctx.response.status = Status.InternalServerError;
      ctx.response.body = {
        status: 'error',
        message: 'Internal server error',
      };
    }
  }
};