import appConfig from "@config/app.ts";
import { logger } from "@utils/logger.ts";

if (import.meta.main) {
  try {
    await appConfig.start();
  } catch (error) {
    logger.error("Failed to start application:", error);
    Deno.exit(1);
  }
}

export default appConfig;