export const MUTE_ERRORS = 'MUTE_ERRORS';
export const MUTE_ERROR = 'MUTE_ERROR';

export const muteErrors = () => ({ type: MUTE_ERRORS });

export const muteError = error => ({ type: MUTE_ERROR, error });
