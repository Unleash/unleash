export const isLocalhostDomain = (hostname = window.location.hostname) =>
    hostname === 'localhost';

export const isUnleashDomain = (hostname = window.location.hostname) =>
    hostname.endsWith('.getunleash.io') ||
    hostname.endsWith('.unleash-hosted.com');

export const isVercelBranchDomain = (hostname = window.location.hostname) =>
    hostname.endsWith('.vercel.app');
