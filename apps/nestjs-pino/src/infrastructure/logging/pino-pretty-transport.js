/**
 * Custom pino-pretty transport wrapper
 * Required because messageFormat as a function is not serializable
 * and cannot be passed directly through Pino's transport configuration
 * 
 * This wrapper defines the messageFormat function internally to include
 * context in the message string: [Context] message
 */
module.exports = (opts) => {
  const pinoPretty = require('pino-pretty');
  
  // Remove messageFormat from options if present (shouldn't be, but just in case)
  const { messageFormat: _, ...restOpts } = opts;
  
  // Define messageFormat function internally to include context in message
  const messageFormat = (log, messageKey) => {
    const context = log.context ? `${log.context} | ` : '';
    const message = log[messageKey] || '';
    return `${context}${message}`;
  };
  
  // Apply messageFormat function directly to pino-pretty
  return pinoPretty({
    ...restOpts,
    messageFormat,
  });
};
