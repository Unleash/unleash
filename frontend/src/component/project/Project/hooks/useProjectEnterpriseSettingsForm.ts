import { useEffect, useState } from 'react';
import type { ProjectLinkTemplateSchema } from 'openapi';

export type ProjectMode = 'open' | 'protected' | 'private';
const useProjectEnterpriseSettingsForm = (
    initialProjectMode: ProjectMode = 'open',
    initialFeatureNamingPattern = '',
    initialFeatureNamingExample = '',
    initialFeatureNamingDescription = '',
    initialLinkTemplates: ProjectLinkTemplateSchema[] = [],
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

    const [linkTemplates, setLinkTemplates] =
        useState<ProjectLinkTemplateSchema[]>(initialLinkTemplates);

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

    useEffect(() => {
        setLinkTemplates(initialLinkTemplates);
    }, [initialLinkTemplates]);

    const getEnterpriseSettingsPayload = () => {
        return {
            mode: projectMode,
            featureNaming: {
                pattern: featureNamingPattern,
                example: featureNamingExample,
                description: featureNamingDescription,
            },
            linkTemplates,
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
        linkTemplates,
        setFeatureNamingPattern,
        setFeatureNamingExample,
        setFeatureNamingDescription,
        setProjectMode,
        setLinkTemplates,
        getEnterpriseSettingsPayload,
        clearErrors,
        errors,
    };
};

export default useProjectEnterpriseSettingsForm;
