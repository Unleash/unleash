import { Registry } from 'prom-client';

// Deliberately keep it separate from the global instance metrics register
// It is a singleton that everyone participating in the impact metrics can import
export const impactRegister = new Registry();
