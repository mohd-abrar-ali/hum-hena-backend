
/**
 * Global Application Configuration
 * 
 * Set MODE to 'production' for live operation.
 */
export const APP_CONFIG = {
  MODE: 'production' as 'demo' | 'production',
  VERSION: '1.0.0',
  DEBUG_LOGS: false,
};

export const isDemo = () => APP_CONFIG.MODE === 'demo';
export const isProd = () => APP_CONFIG.MODE === 'production';
