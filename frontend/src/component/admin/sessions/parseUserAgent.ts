export const parseUserAgent = (ua: string | null): string => {
    if (!ua) return '—';
    const browser = /Edg\//.test(ua)
        ? 'Edge'
        : /OPR\/|Opera/.test(ua)
          ? 'Opera'
          : /Chrome\//.test(ua)
            ? 'Chrome'
            : /Firefox\//.test(ua)
              ? 'Firefox'
              : /Safari\//.test(ua)
                ? 'Safari'
                : null;
    const os = /Windows/.test(ua)
        ? 'Windows'
        : /Mac OS X/.test(ua)
          ? 'macOS'
          : /Android/.test(ua)
            ? 'Android'
            : /(iPhone|iPad)/.test(ua)
              ? 'iOS'
              : /Linux/.test(ua)
                ? 'Linux'
                : null;
    return [browser, os].filter(Boolean).join(' / ') || '—';
};
