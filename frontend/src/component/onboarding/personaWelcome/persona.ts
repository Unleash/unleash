/**
 * Persona detection for the personalized onboarding welcome card.
 *
 * The signup flow asks "What's your role?" and stores it as `companyRole`
 * on the user. These helpers map that role to one of two onboarding
 * personas. Since `companyRole` is often unset (OSS/dev environments),
 * a localStorage override is supported for demos and for users who want
 * to switch persona after the fact.
 */

export const PERSONA_OVERRIDE_STORAGE_KEY = 'unleash-persona-override';

// Keep in sync with the role options in SignupDialogAccountDetails.
export const companyRoles = [
    'Developer',
    'Engineering Manager',
    'Product Manager',
    'Designer/UX',
    'DevOps Engineer',
    'QA/Test Engineer',
    'Executive',
    'Other',
] as const;

export type CompanyRole = (typeof companyRoles)[number];

export type Persona = 'technical' | 'product';

const productRoles: ReadonlySet<string> = new Set([
    'Product Manager',
    'Engineering Manager',
    'Executive',
    'Designer/UX',
]);

export const resolvePersona = (companyRole?: string | null): Persona =>
    companyRole && productRoles.has(companyRole) ? 'product' : 'technical';

export const readPersonaOverride = (): string | null => {
    try {
        return window.localStorage.getItem(PERSONA_OVERRIDE_STORAGE_KEY);
    } catch {
        return null;
    }
};

export const writePersonaOverride = (companyRole: string): void => {
    try {
        window.localStorage.setItem(PERSONA_OVERRIDE_STORAGE_KEY, companyRole);
    } catch {
        // localStorage unavailable (e.g. blocked); override is best-effort
    }
};
