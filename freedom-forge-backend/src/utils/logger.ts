/**
 * Logger utility for consistent application logging
 */
 class Logger {
    private getTimestamp(): string {
      return new Date().toISOString();
    }
  
    private formatMessage(level: string, message: string, ...args: unknown[]): string {
      const timestamp = this.getTimestamp();
      const formattedArgs = args.length ? JSON.stringify(args) : '';
      return `[${timestamp}] ${level}: ${message} ${formattedArgs}`.trim();
    }
  
    public info(message: string, ...args: unknown[]): void {
      console.info(this.formatMessage('INFO', message, ...args));
    }
  
    public error(message: string, ...args: unknown[]): void {
      console.error(this.formatMessage('ERROR', message, ...args));
    }
  
    public warn(message: string, ...args: unknown[]): void {
      console.warn(this.formatMessage('WARN', message, ...args));
    }
  
    public debug(message: string, ...args: unknown[]): void {
      if (Deno.env.get('ENV') !== 'production') {
        console.debug(this.formatMessage('DEBUG', message, ...args));
      }
    }
  }
  
  export const logger = new Logger();