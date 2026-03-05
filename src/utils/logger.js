/**
 * Logger utility for consistent error and info logging
 */
const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

class Logger {
  constructor(isDev = import.meta.env.MODE === "development") {
    this.isDev = isDev;
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data }),
    };

    if (this.isDev || level === LOG_LEVELS.ERROR) {
      console[level === LOG_LEVELS.ERROR ? "error" : "log"](
        `[${timestamp}] ${level}: ${message}`,
        data || ""
      );
    }

    return logEntry;
  }

  error(message, error = null) {
    return this.log(LOG_LEVELS.ERROR, message, error);
  }

  warn(message, data = null) {
    return this.log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data = null) {
    return this.log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data = null) {
    if (this.isDev) {
      return this.log(LOG_LEVELS.DEBUG, message, data);
    }
  }
}

export default new Logger();
