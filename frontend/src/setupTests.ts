import '@testing-library/jest-dom';
import 'whatwg-fetch';
import 'regenerator-runtime';

class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

if (!window.ResizeObserver) {
    window.ResizeObserver = ResizeObserver;
}

process.env.TZ = 'UTC';
