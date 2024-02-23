import { colors } from 'themes/colors';

export const getProjectColor = (str: string): string => {
    if (str === 'default') {
        // Special case for default project - use primary color
        return colors.purple[800];
    }

    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return `#${'00000'.substring(0, 6 - c.length)}${c}`;
};
