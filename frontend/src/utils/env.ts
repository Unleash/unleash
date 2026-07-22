export const isLocalhostDomain = (hostname = window.location.hostname) =>
    /^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^\[?(?:0*:)*?:?0*1\]?$/.test(
        hostname,
    );

export const isUnleashDomain = (hostname = window.location.hostname) =>
    hostname.endsWith('.getunleash.io') ||
    hostname.endsWith('.unleash-hosted.com');

export const isVercelBranchDomain = (hostname = window.location.hostname) =>
    hostname.endsWith('.vercel.app');
