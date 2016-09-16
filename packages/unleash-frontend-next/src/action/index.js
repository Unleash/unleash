let nextFeatureId = 0;
export const addFeatureToggle = (featureName) => ({
    type: 'ADD_FEATURE_TOGGLE',
    id: nextFeatureId++,
    featureName,
});

export const toggleFeature = (id) => ({
    type: 'TOGGLE_FEATURE_TOGGLE',
    id,
});
