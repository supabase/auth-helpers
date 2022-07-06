const dev = process.env.NODE_ENV !== 'production';

const logger = {
  log: (message?: any, ...optionalParams: any[]) => {
    dev ? console.log(message, ...optionalParams) : null;
  },
  error: (message?: any, ...optionalParams: any[]) => {
    console.error(message, ...optionalParams);
  },
  info: (message?: any, ...optionalParams: any[]) => {
    logger.log(message, ...optionalParams);
  },
  debug: (message?: any, ...optionalParams: any[]) => {
    logger.log(message, ...optionalParams);
  },
  warn: (message?: any, ...optionalParams: any[]) => {
    dev ? logger.error(message, ...optionalParams) : null;
  }
};

export default logger;
