export const INCIDENT_TYPE = {
  NO_SHOW: 'no_show',
  LATE_CANCEL: 'late_cancel',
} as const;

export type IncidentType = (typeof INCIDENT_TYPE)[keyof typeof INCIDENT_TYPE];

export const INCIDENT_NOT_FOUND_MESSAGE = 'Incident not found';
export const INCIDENT_ALREADY_RECORDED_MESSAGE = 'An incident has already been recorded for this booking';
