export const Achievements = {
    FIRST_LOGIN: {
        id: 'FIRST_LOGIN',
        title: 'Hello Unleash',
        description: 'Sign in for the first time',
        imageUrl: 'https://www.getunleash.io/logos/unleash_glyph_pos.svg',
    },
    FIRST_TOGGLE: {
        id: 'FIRST_TOGGLE',
        title: 'Toggle Creator',
        description: 'Create your first feature toggle',
        imageUrl: 'https://www.getunleash.io/logos/unleash_glyph_pos.svg',
    },
};

export type Achievement = typeof Achievements[keyof typeof Achievements];
