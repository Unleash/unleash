import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box, styled } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { InstancePrivacySection } from './InstancePrivacySection';
import { useTelemetry } from 'hooks/api/getters/useTelemetry/useTelemetry';

interface IFeatureActivenessManagementInfo {
    enabled: IActivenessManagementInfo;
    disabled: IActivenessManagementInfo;
}

interface IActivenessManagementInfo {
    environmentVariables: string;
    changeInfoText: string;
}

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(4),
}));

const versionCollectionDetails = {
    title: 'Version data collection',
    infoText:
        "We collect the version of Unleash that you're using. We use this information to inform your Unleash instance of latest updates and critical security patches.",

    concreteDetails: {
        'Instance ID': 'A unique ID generated for your instance',
        Version: "The version of Unleash that you're using",
    },
};

const featureCollectionDetails = {
    title: 'Feature data collection',
    infoText:
        'We collect data about your instance to improve the Unleash product user experience. We may also use the data in case you need help from our support team. Data collection is for internal use only and is not shared with third parties outside Unleash. As we want you to be in control of your data, we will leave it up to you to allow us to collect your data.',
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
            environmentVariables: 'CHECK_VERSION=false',
            changeInfoText:
                'Version info collection can be disabled by setting the environment variable `CHECK_VERSION` to `false` and restarting Unleash.',
        },
        disabled: {
            environmentVariables: 'CHECK_VERSION=true',
            changeInfoText:
                'Version info collection can be enabled by setting the environment variable to true and restarting Unleash.',
        },
    };

const featureCollectionActivenessManagementTexts: IFeatureActivenessManagementInfo =
    {
        enabled: {
            environmentVariables: 'SEND_TELEMETRY=false',
            changeInfoText:
                'Feature usage collection can be disabled by setting the environment variable to false and restarting Unleash.',
        },
        disabled: {
            environmentVariables: 'SEND_TELEMETRY=true',
            changeInfoText:
                'To enable feature usage collection set the environment variable to true and restart Unleash.',
        },
    };

export const InstancePrivacy = () => {
    const { settings } = useTelemetry();
    const { loading } = useUiConfig();

    if (loading) {
        return null;
    }

    const versionActivenessInfo = settings?.versionInfoCollectionEnabled
        ? versionCollectionActivenessManagementTexts.enabled
        : versionCollectionActivenessManagementTexts.disabled;

    const featureActivenessInfo = settings?.featureInfoCollectionEnabled
        ? featureCollectionActivenessManagementTexts.enabled
        : featureCollectionActivenessManagementTexts.disabled;

    let dependsOnFeatureCollection: undefined | string = undefined;
    if (!settings?.versionInfoCollectionEnabled)
        dependsOnFeatureCollection = settings?.featureInfoCollectionEnabled
            ? 'Note: Feature usage collection is enabled, but for it to be active you must also enable version info collection'
            : 'When you enable feature usage collection you must also enable version info collection';

    return (
        <PageContent header={<PageHeader title="Instance Privacy" />}>
            <StyledBox>
                <InstancePrivacySection
                    title={versionCollectionDetails.title}
                    infoText={versionCollectionDetails.infoText}
                    concreteDetails={versionCollectionDetails.concreteDetails}
                    enabled={settings?.versionInfoCollectionEnabled}
                    changeInfoText={versionActivenessInfo.changeInfoText}
                    variablesText={versionActivenessInfo.environmentVariables}
                />
                <InstancePrivacySection
                    title={featureCollectionDetails.title}
                    infoText={featureCollectionDetails.infoText}
                    concreteDetails={featureCollectionDetails.concreteDetails}
                    enabled={
                        settings?.featureInfoCollectionEnabled &&
                        settings?.versionInfoCollectionEnabled
                    }
                    changeInfoText={featureActivenessInfo.changeInfoText}
                    variablesText={featureActivenessInfo.environmentVariables}
                    dependsOnText={dependsOnFeatureCollection}
                />
            </StyledBox>
        </PageContent>
    );
};
