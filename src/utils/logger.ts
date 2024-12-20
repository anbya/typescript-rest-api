import { format, createLogger, transports, Logger } from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, label, printf } = format;

// Label
const types = ['info', 'error'] as const;
const CATEGORY = "SERVER";

// Custom Log Format
const customFormat = printf(({ timestamp, label, level, message }) => {
  return `| ${timestamp} | ${label} | ${level}: ${message}`;
});

// Create File Transport Logger
const fileTransport: Record<typeof types[number], Logger> = types.reduce((memo, type) => {
  memo[type] = createLogger({
    level: type,
    format: combine(
      label({ label: CATEGORY }),
      timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      customFormat
    ),
    transports: [
      new transports.DailyRotateFile({
        filename: `logs/${type}-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        maxFiles: "30d",
      }),
      new transports.Console(),
    ],
  });
  return memo;
}, {} as Record<typeof types[number], Logger>);

// API Logger Function
export const apiLogger = (level: typeof types[number], message: string): void => {
  if (fileTransport[level]) {
    fileTransport[level].log(level, message);
  } else {
    throw new Error(`Invalid log level: ${level}`);
  }
};