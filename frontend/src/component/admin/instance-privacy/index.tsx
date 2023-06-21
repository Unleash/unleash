import AccessContext from 'contexts/AccessContext';
import React, { useContext, useState } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box, styled } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { InstancePrivacy } from './InstancePrivacy';
import { useTelemetry } from 'hooks/api/getters/useTelemetry/useTelemetry';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IFeatureActivenessManagementInfo {
    enabled: IActivenessManagementInfo;
    disabled: IActivenessManagementInfo;
}

interface IActivenessManagementInfo {
    environmentVariables: String[];
    changeInfoText: String;
}

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
        /*SAML: 'Whether or not SAML SSO is in use',
        OIDC: 'Whether or not OIDC SSO is in use',*/
        'Feature Exports': 'The number of feature exports performed',
        'Feature Imports': 'The number of feature imports performed',
        'Custom Strategies':
            'The number of custom strategies defined in your instance',
        'Custom Strategies In Use':
            'The number of custom strategies that are in use by feature toggles',
    },
};

const versionCollectionActivenessManagementTexts: IFeatureActivenessManagementInfo =
    {
        enabled: {
            environmentVariables: ['CHECK_VERSION=false'],
            changeInfoText:
                'Version Info Collection can be disabled by setting the environment variable to anything other than true and restarting Unleash.',
        },
        disabled: {
            environmentVariables: ['CHECK_VERSION=true'],
            changeInfoText:
                'Version Info Collection can be enabled by setting the environment variable to true and restarting Unleash.',
        },
    };

const featureCollectionActivenessManagementTexts: IFeatureActivenessManagementInfo =
    {
        enabled: {
            environmentVariables: ['SEND_TELEMETRY=false'],
            changeInfoText:
                'Feature Usage Collection can be disabled by setting the environment variable to false and restarting Unleash.',
        },
        disabled: {
            environmentVariables: ['SEND_TELEMETRY=true'],
            changeInfoText:
                'To enable Feature Usage Collection set the environment variable to true and restart Unleash.',
        },
    };

export const InstancePrivacyAdmin = () => {
    const { settings } = useTelemetry();
    const { uiConfig, loading } = useUiConfig();

    if (loading) {
        return null;
    }

    const versionActivenessInfo = settings?.versionInfoCollectionEnabled
        ? versionCollectionActivenessManagementTexts.enabled
        : versionCollectionActivenessManagementTexts.disabled;

    const featureActivenessInfo = settings?.featureInfoCollectionEnabled
        ? featureCollectionActivenessManagementTexts.enabled
        : featureCollectionActivenessManagementTexts.disabled;

    let dependsOnFeatureCollection: undefined | String = undefined;
    if (!settings?.versionInfoCollectionEnabled)
        dependsOnFeatureCollection = settings?.featureInfoCollectionEnabled
            ? 'Note: Feature Usage Collection is enabled, but for it to be active you must also enable Version Info Collection'
            : 'When you enable Feature Usage Collection you must also enable Version Info Collection';

    return (
        <PageContent header={<PageHeader title="Instance Privacy" />}>
            <StyledBox>
                <InstancePrivacy
                    title={versionCollectionDetails.title}
                    infoText={versionCollectionDetails.infoText}
                    concreteDetails={versionCollectionDetails.concreteDetails}
                    enabled={settings?.versionInfoCollectionEnabled}
                    changeInfoText={versionActivenessInfo.changeInfoText}
                    variablesTexts={versionActivenessInfo.environmentVariables}
                />
                <ConditionallyRender
                    condition={Boolean(uiConfig.flags.experimentalExtendedTelemetry)}
                    show={
                        <InstancePrivacy
                            title={featureCollectionDetails.title}
                            infoText={featureCollectionDetails.infoText}
                            concreteDetails={
                                featureCollectionDetails.concreteDetails
                            }
                            enabled={settings?.featureInfoCollectionEnabled && settings?.versionInfoCollectionEnabled}
                            changeInfoText={
                                featureActivenessInfo.changeInfoText
                            }
                            variablesTexts={
                                featureActivenessInfo.environmentVariables
                            }
                            dependsOnText={dependsOnFeatureCollection}
                        />
                    }
                />
            </StyledBox>
        </PageContent>
    );
};
