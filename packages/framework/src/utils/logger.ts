export type FrameworkLogger = {
  debug?: (message: string, context?: unknown) => void;
  info?: (message: string, context?: unknown) => void;
  warn?: (message: string, context?: unknown) => void;
  error?: (message: string, context?: unknown) => void;
};

type LoggerGlobals = {
  buildBloxLogger?: FrameworkLogger;
  frameworkLogger?: FrameworkLogger;
  __buildBloxFrameworkLogger__?: FrameworkLogger;
};

export const getFrameworkLogger = (): FrameworkLogger | null => {
  const globals = globalThis as typeof globalThis & LoggerGlobals;
  return (
    globals.__buildBloxFrameworkLogger__ ??
    globals.buildBloxLogger ??
    globals.frameworkLogger ??
    null
  );
};
