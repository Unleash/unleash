export const MAX_USER_AGENT_LENGTH = 512;

const NON_PRINTABLE = /\p{C}/gu;

export const sanitizeUserAgent = (rawUserAgent?: string): string | undefined =>
    rawUserAgent
        ?.replace(NON_PRINTABLE, '') // clean first
        .trim()
        .slice(0, MAX_USER_AGENT_LENGTH) // fills to 512
        .replace(NON_PRINTABLE, '') || undefined; // drops rest the cut made
