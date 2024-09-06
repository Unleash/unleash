import mediaQuery from 'css-mediaquery';

const createMatchMedia = (width: number) => {
    return (query: string) => {
        return {
            matches: mediaQuery.match(query, { width }),
            media: '',
            addListener: () => {},
            removeListener: () => {},
            onchange: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
        };
    };
};

export const resizeScreen = (width: number) => {
    window.matchMedia = createMatchMedia(width);
};
