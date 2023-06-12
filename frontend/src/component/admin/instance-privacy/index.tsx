import AccessContext from 'contexts/AccessContext';
import React, { useContext, useState } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box, styled } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { InstancePrivacy } from './InstancePrivacy';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(4),
}));

const versionCollectionDetails = {
    title: 'Version data collection',
    infoText:
        "We collect the version of Unleash that you're using. We use this information to inform your Unleash instance of latest updates and and critical security patches.",

    concreteDetails: {
        'Instance ID': 'A unique ID generated for your instance',
        Version: "The version of Unleash that you're using",
    },
};

const featureCollectionDetails = {
    title: 'Feature data collection',
    infoText:
        'We collect data about your instance to improve the Unleash product user experience. Also we use the data in case you need help from our support. Data collection is for internal use and is not shared with third parties outside Unleash. As we want you to be in control of your data, we will leave it up to you to allow us to collect your data.',
    concreteDetails: {
        'Feature toggles': 'The number of feature toggles in your instance',
        Users: 'The number of users registered in your instance',
        Projects: 'The number of projects in your instance',
        'Context Fields': 'The number of custom context fields in use',
        Groups: 'The number of groups present in your instance',
        Roles: 'The number of custom roles defined in your instance',
        Environments: 'The number of environments in your instance',
        Segments: 'The number of segments defined in your instance',
        Strategies: 'The number of strategies defined in your instance',
        SAML: 'Whether or not SAML SSO is in use',
        OIDC: 'Whether or not OIDC SSO is in use',
        'Feature Exports': 'The number of feature exports performed',
        'Feature Imports': 'The number of feature imports performed',
        'Custom Strategies':
            'The number of custom strategies defined in your instance',
    },
};

export const InstancePrivacyAdmin = () => {
    const { hasAccess } = useContext(AccessContext);

    const [telemetryCollection, setTelemetryCollection] = useState({
        versionCollectionEnabled: true,
        featureCollectionEnabled: false,
    });

    const { loading } = useUiConfig();

    if (loading) {
        return null;
    }

    return (
        <PageContent header={<PageHeader title="Instance Privacy" />}>
            <StyledBox>
                <InstancePrivacy
                    title={versionCollectionDetails.title}
                    infoText={versionCollectionDetails.infoText}
                    concreteDetails={versionCollectionDetails.concreteDetails}
                    onChange={() => {
                        setTelemetryCollection({
                            ...telemetryCollection,
                            versionCollectionEnabled:
                                !telemetryCollection.versionCollectionEnabled,
                        });
                    }}
                    enabled={telemetryCollection.versionCollectionEnabled}
                />
                <InstancePrivacy
                    title={featureCollectionDetails.title}
                    infoText={featureCollectionDetails.infoText}
                    concreteDetails={featureCollectionDetails.concreteDetails}
                    onChange={() => {
                        setTelemetryCollection({
                            ...telemetryCollection,
                            featureCollectionEnabled:
                                !telemetryCollection.featureCollectionEnabled,
                        });
                    }}
                    enabled={telemetryCollection.featureCollectionEnabled}
                />
            </StyledBox>
        </PageContent>
    );
};
