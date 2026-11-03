import { canMatchPages, toPagePattern } from '../triggers/pagePattern.ts';
import type {
    SurveyTrigger,
    TriggerCondition,
} from '../triggers/surveyTrigger.ts';

export type TriggerMode = 'always' | 'custom';

// Flat so that the fields of one condition survive switching to another and back.
export interface TriggerDraft {
    mode: TriggerMode;
    on: TriggerCondition['on'];
    path: string;
}

export interface TriggerErrors {
    path?: string;
}

const ALWAYS_TRIGGER: SurveyTrigger = { on: 'page' };

export const initialTriggerDraft = (): TriggerDraft => ({
    mode: 'always',
    on: 'page',
    path: '',
});

export const validatePage = (page: string): string | undefined => {
    const trimmedPage = page.trim();
    if (trimmedPage === '') {
        return undefined;
    }
    if (!trimmedPage.startsWith('/')) {
        return 'Start the pattern with /, for example /projects/:projectId';
    }
    return !canMatchPages() || toPagePattern(trimmedPage) !== null
        ? undefined
        : 'This is not a valid page pattern';
};

export const validateTriggerDraft = (draft: TriggerDraft): TriggerErrors =>
    draft.mode === 'always' ? {} : { path: validatePage(draft.path) };

export const hasTriggerErrors = (errors: TriggerErrors): boolean =>
    Object.values(errors).some(Boolean);

export const toTrigger = (draft: TriggerDraft): SurveyTrigger => {
    if (draft.mode === 'always') {
        return ALWAYS_TRIGGER;
    }
    const path = draft.path.trim();
    return path === '' ? { on: draft.on } : { on: draft.on, path };
};

export type PageMatch =
    | 'match'
    | 'match-every-page'
    | 'no-match'
    | 'invalid-pattern'
    | 'invalid-url';

const toPathname = (url: string): string | null => {
    try {
        // new URL needs a base to parse a bare path; only the pathname is read, so the base's domain doesn't matter.
        return url.startsWith('/')
            ? new URL(url, 'https://example.com').pathname
            : new URL(url).pathname;
    } catch {
        return null;
    }
};

export const matchPage = (page: string, url: string): PageMatch => {
    const pathname = toPathname(url.trim());
    if (pathname === null) {
        return 'invalid-url';
    }
    const trimmedPage = page.trim();
    if (trimmedPage === '') {
        return 'match-every-page';
    }
    const pattern = toPagePattern(trimmedPage);
    if (pattern === null) {
        return 'invalid-pattern';
    }
    return pattern.test({ pathname }) ? 'match' : 'no-match';
};
