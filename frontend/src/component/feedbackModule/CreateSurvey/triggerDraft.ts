import {
    type ElementMatch,
    isValidSelector,
} from '../triggers/elementMatch.ts';
import { canMatchPages, toPagePattern } from '../triggers/pagePattern.ts';
import {
    isValidDelayMs,
    isValidOccurrence,
    type SurveyTrigger,
    type TriggerCondition,
} from '../triggers/surveyTrigger.ts';

export type TriggerMode = 'always' | 'custom';

// Flat so that the fields of one condition survive switching to another and back.
export interface TriggerDraft {
    mode: TriggerMode;
    on: TriggerCondition['on'];
    path: string;
    delayMs: string;
    onOccurrence: string;
    selector: string;
    text: string;
}

export interface TriggerErrors {
    path?: string;
    delayMs?: string;
    onOccurrence?: string;
    selector?: string;
}

const ALWAYS_TRIGGER: SurveyTrigger = { on: 'page' };

export const initialTriggerDraft = (): TriggerDraft => ({
    mode: 'always',
    on: 'page',
    path: '',
    delayMs: '0',
    onOccurrence: '1',
    selector: '',
    text: '',
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

// An empty number input gives '', which Number would read as 0.
const toNumber = (value: string): number =>
    value.trim() === '' ? Number.NaN : Number(value);

const validateDelayMs = (delayMs: string): string | undefined =>
    isValidDelayMs(toNumber(delayMs))
        ? undefined
        : 'Enter a whole number of milliseconds, 0 or more';

const validateOccurrence = (onOccurrence: string): string | undefined =>
    isValidOccurrence(toNumber(onOccurrence))
        ? undefined
        : 'Enter a whole number, 1 or more';

export const validateSelector = (
    selector: string,
    text: string,
): string | undefined => {
    const trimmedSelector = selector.trim();
    if (trimmedSelector === '') {
        return text.trim() === ''
            ? 'Enter a CSS selector, text or both'
            : undefined;
    }
    return isValidSelector(trimmedSelector)
        ? undefined
        : 'This is not a valid CSS selector';
};

export const validateTriggerDraft = (draft: TriggerDraft): TriggerErrors =>
    draft.mode === 'always'
        ? {}
        : {
              path: validatePage(draft.path),
              delayMs: validateDelayMs(draft.delayMs),
              onOccurrence: validateOccurrence(draft.onOccurrence),
              selector:
                  draft.on === 'click'
                      ? validateSelector(draft.selector, draft.text)
                      : undefined,
          };

export const hasTriggerErrors = (errors: TriggerErrors): boolean =>
    Object.values(errors).some(Boolean);

const toElementMatch = (draft: TriggerDraft): ElementMatch => {
    const selector = draft.selector.trim();
    const text = draft.text.trim();
    if (selector === '') {
        return { text };
    }
    return text === '' ? { selector } : { selector, text };
};

const toCondition = (draft: TriggerDraft): TriggerCondition => {
    switch (draft.on) {
        case 'page':
            return { on: 'page' };
        case 'click':
            return { on: 'click', ...toElementMatch(draft) };
    }
};

export const toTrigger = (draft: TriggerDraft): SurveyTrigger => {
    if (draft.mode === 'always') {
        return ALWAYS_TRIGGER;
    }
    const condition = toCondition(draft);
    const path = draft.path.trim();
    return {
        ...condition,
        ...(path === '' ? {} : { path }),
        delayMs: toNumber(draft.delayMs),
        onOccurrence: toNumber(draft.onOccurrence),
    };
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
