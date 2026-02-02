export interface FrameworkLogger {
  debug?: (message: string, context?: unknown) => void;
  info?: (message: string, context?: unknown) => void;
  warn?: (message: string, context?: unknown) => void;
  error?: (message: string, context?: unknown) => void;
}

let frameworkLogger: FrameworkLogger | null = null;

export const setFrameworkLogger = (logger: FrameworkLogger | null) => {
  frameworkLogger = logger;
};

export const getFrameworkLogger = () => frameworkLogger;
