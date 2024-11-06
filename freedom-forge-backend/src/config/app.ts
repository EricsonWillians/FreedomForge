import { Application, Router } from "oak";
import { load } from "$std/dotenv/mod.ts";
import { logger } from "@utils/logger.ts";
import { errorHandler } from "@utils/errors.ts";
import { validateRequest } from "@utils/validation.ts";
import type { State } from "@types/state.ts";

/** Environment configuration interface */
interface EnvConfig {
  readonly PORT: number;
  readonly HOST: string;
  readonly ENV: 'development' | 'production' | 'test';
  readonly API_VERSION: string;
}

/** Application configuration class */
class AppConfig {
  private readonly app: Application<State>;
  private readonly env: EnvConfig;
  private readonly router: Router<State>;

  constructor() {
    this.app = new Application<State>();
    this.router = new Router<State>();
    this.env = this.loadEnv();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /** Load environment variables */
  private loadEnv(): EnvConfig {
    const env = load();
    
    return {
      PORT: parseInt(env.PORT || '3000'),
      HOST: env.HOST || '0.0.0.0',
      ENV: (env.ENV || 'development') as EnvConfig['ENV'],
      API_VERSION: env.API_VERSION || 'v1',
    };
  }

  /** Configure application middleware */
  private setupMiddleware(): void {
    // Error handling middleware
    this.app.use(errorHandler);

    // Request validation middleware
    this.app.use(validateRequest);

    // Request logging middleware
    this.app.use(async (ctx, next): Promise<void> => {
      const start: number = Date.now();
      try {
        await next();
      } finally {
        const ms: number = Date.now() - start;
        const status: number = ctx.response.status;
        logger.info(`${ctx.request.method} ${ctx.request.url} ${status} - ${ms}ms`);
      }
    });

    // State initialization middleware
    this.app.use(async (ctx, next): Promise<void> => {
      ctx.state = {
        env: this.env.ENV,
        startTime: Date.now(),
      };
      await next();
    });
  }

  /** Configure application routes */
  private setupRoutes(): void {
    // Health check endpoint
    this.router.get('/health', (ctx): void => {
      ctx.response.status = 200;
      ctx.response.body = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: this.env.API_VERSION,
        environment: this.env.ENV,
        uptime: Date.now() - ctx.state.startTime,
      };
    });

    // API version router
    const apiRouter = new Router<State>({
      prefix: `/api/${this.env.API_VERSION}`,
    });

    // Mount routers
    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());
    this.app.use(apiRouter.routes());
    this.app.use(apiRouter.allowedMethods());
  }

  /** Configure error handling */
  private setupErrorHandling(): void {
    this.app.addEventListener('error', (evt): void => {
      logger.error('Unhandled application error:', evt.error);
    });
  }

  /** Start the application server */
  public async start(): Promise<void> {
    try {
      logger.info(`Starting server in ${this.env.ENV} mode...`);
      
      await this.app.listen({
        port: this.env.PORT,
        hostname: this.env.HOST,
      });

      logger.info(`Server running on http://${this.env.HOST}:${this.env.PORT}`);
    } catch (error) {
      logger.error('Failed to start server:', error);
      Deno.exit(1);
    }
  }
}

// Create and export app instance
const appConfig = new AppConfig();
export default appConfig;