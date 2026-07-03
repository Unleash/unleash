import { ClosedDemoLab } from './ClosedDemoLab.tsx';

/**
 * TEMPORARY preview route (`/closed-demo-preview`) for eyeballing the onboarding
 * closed-demo variants without going through the enterprise pay-as-you-go signup
 * flow or logging in. Renders the variant-comparison lab. Safe to delete
 * together with its route entry in `component/menu/routes.ts`.
 */
export const ClosedDemoPreview = () => <ClosedDemoLab />;
