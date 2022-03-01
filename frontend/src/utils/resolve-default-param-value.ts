export const resolveDefaultParamValue = (
    name: string,
    featureToggleName: string
): string | number => {
    switch (name) {
        case 'percentage':
        case 'rollout':
            return 100;
        case 'stickiness':
            return 'default';
        case 'groupId':
            return featureToggleName;
        default:
            return '';
    }
};
