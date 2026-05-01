export const SETTINGS_KEY = {
  SALON_NAME: 'salon_name',
  SALON_ADDRESS: 'salon_address',
  SALON_PHONE: 'salon_phone',
  CURRENCY: 'currency',
  TIMEZONE: 'timezone',
  TIP_POOLING_ENABLED: 'tip_pooling_enabled',
  TIP_POOL_PERCENTAGE: 'tip_pool_percentage',
  DEFAULT_BOOKING_BUFFER: 'default_booking_buffer',
  AUTO_LOGOUT_MINUTES: 'auto_logout_minutes',
  RECEIPT_FOOTER_TEXT: 'receipt_footer_text',
  NO_SHOW_THRESHOLD: 'no_show_threshold',
  CANCELLATION_WINDOW_HOURS: 'cancellation_window_hours',
} as const;

export const SETTINGS_DEFAULTS: Record<string, string> = {
  [SETTINGS_KEY.SALON_NAME]: 'Lovely Nails',
  [SETTINGS_KEY.CURRENCY]: 'USD',
  [SETTINGS_KEY.TIMEZONE]: 'Pacific/Guam',
  [SETTINGS_KEY.TIP_POOLING_ENABLED]: 'false',
  [SETTINGS_KEY.TIP_POOL_PERCENTAGE]: '0',
  [SETTINGS_KEY.DEFAULT_BOOKING_BUFFER]: '15',
  [SETTINGS_KEY.AUTO_LOGOUT_MINUTES]: '30',
  [SETTINGS_KEY.NO_SHOW_THRESHOLD]: '2',
  [SETTINGS_KEY.CANCELLATION_WINDOW_HOURS]: '24',
};
