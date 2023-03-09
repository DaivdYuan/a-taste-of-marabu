import * as winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple()
  ),
  transports: new winston.transports.Console()
})
