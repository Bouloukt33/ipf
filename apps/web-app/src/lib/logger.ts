/**
 * Logger sécurisé pour environnement de production
 * - En développement : affiche tous les logs
 * - En production : logs silencieux (ou envoi vers service de monitoring)
 */

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  /** Préfixe pour identifier la source du log */
  prefix?: string;
}

function formatMessage(prefix: string | undefined, message: string): string {
  return prefix ? `[${prefix}] ${message}` : message;
}

/**
 * En production, vous pouvez envoyer les erreurs critiques vers :
 * - Sentry, Datadog, LogRocket, etc.
 * Exemple: Sentry.captureException(error)
 */
function reportToMonitoring(_level: LogLevel, _message: string, _data?: unknown): void {
  // TODO: Intégrer votre service de monitoring ici
  // if (level === 'error') Sentry.captureMessage(message, { extra: data });
}

export function createLogger(options: LoggerOptions = {}) {
  const { prefix } = options;

  return {
    /** Debug : uniquement en dev, pour le débogage détaillé */
    debug(message: string, ...data: unknown[]): void {
      if (isDev) {
        console.debug(formatMessage(prefix, message), ...data);
      }
    },

    /** Info : uniquement en dev */
    info(message: string, ...data: unknown[]): void {
      if (isDev) {
        console.info(formatMessage(prefix, message), ...data);
      }
    },

    /** Warn : uniquement en dev, mais peut être tracké en prod */
    warn(message: string, ...data: unknown[]): void {
      if (isDev) {
        console.warn(formatMessage(prefix, message), ...data);
      } else {
        reportToMonitoring('warn', formatMessage(prefix, message), data);
      }
    },

    /** Error : affiché en dev, reporté en prod (sans détails sensibles) */
    error(message: string, ...data: unknown[]): void {
      if (isDev) {
        console.error(formatMessage(prefix, message), ...data);
      } else {
        reportToMonitoring('error', formatMessage(prefix, message), data);
      }
    },
  };
}

// Loggers pré-configurés par domaine
export const apiLogger = createLogger({ prefix: 'API' });
export const quizLogger = createLogger({ prefix: 'Quiz' });
export const authLogger = createLogger({ prefix: 'Auth' });
