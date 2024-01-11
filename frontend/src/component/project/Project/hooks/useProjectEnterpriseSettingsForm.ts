import { useEffect, useState } from 'react';

export type ProjectMode = 'open' | 'protected' | 'private';
const useProjectEnterpriseSettingsForm = (
    initialProjectMode: ProjectMode = 'open',
    initialFeatureNamingPattern = '',
    initialFeatureNamingExample = '',
    initialFeatureNamingDescription = '',
) => {
    const [projectMode, setProjectMode] =
        useState<ProjectMode>(initialProjectMode);
    const [featureNamingPattern, setFeatureNamingPattern] = useState(
        initialFeatureNamingPattern,
    );
    const [featureNamingExample, setFeatureNamingExample] = useState(
        initialFeatureNamingExample,
    );

    const [featureNamingDescription, setFeatureNamingDescription] = useState(
        initialFeatureNamingDescription,
    );

    const [errors, setErrors] = useState({});

    useEffect(() => {
        setProjectMode(initialProjectMode);
    }, [initialProjectMode]);

    useEffect(() => {
        setFeatureNamingPattern(initialFeatureNamingPattern);
    }, [initialFeatureNamingPattern]);

    useEffect(() => {
        setFeatureNamingExample(initialFeatureNamingExample);
    }, [initialFeatureNamingExample]);

    useEffect(() => {
        setFeatureNamingDescription(initialFeatureNamingDescription);
    }, [initialFeatureNamingDescription]);

    const getEnterpriseSettingsPayload = () => {
        return {
            mode: projectMode,
            featureNaming: {
                pattern: featureNamingPattern,
                example: featureNamingExample,
                description: featureNamingDescription,
            },
        };
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        projectMode,
        featureNamingPattern,
        featureNamingExample,
        featureNamingDescription,
        setFeatureNamingPattern,
        setFeatureNamingExample,
        setFeatureNamingDescription,
        setProjectMode,
        getEnterpriseSettingsPayload,
        clearErrors,
        errors,
    };
};

export default useProjectEnterpriseSettingsForm;
