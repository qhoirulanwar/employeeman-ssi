import { getSiteURL } from '@/lib/get-site-url';
import { LogLevel } from '@/lib/logger';

export interface Config {
  site: { name: string; description: string; themeColor: string; url: string };
  serverURL: string;
  logLevel: keyof typeof LogLevel;
}

export const config: Config = {
  serverURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030",
  site: { name: 'Human Resource', description: '', themeColor: '#090a0b', url: getSiteURL() },
  logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as keyof typeof LogLevel) ?? LogLevel.ALL,
};
