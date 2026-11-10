export const ENVIRONMENT_COLUMN_PREFIX = 'environment:';

export const formatEnvironmentColumnId = (environment: string) =>
    `${ENVIRONMENT_COLUMN_PREFIX}${environment}`;

// Environment names are customer data, so every environment column reports as 'environment'.
export const trackedColumnName = (columnId: string) =>
    columnId.startsWith(ENVIRONMENT_COLUMN_PREFIX) ? 'environment' : columnId;
