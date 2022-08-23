import { useState } from 'react';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import EnvironmentStrategyDialog from 'component/common/EnvironmentStrategiesDialog/EnvironmentStrategyDialog';
import FeatureOverviewEnvSwitch from './FeatureOverviewEnvSwitch/FeatureOverviewEnvSwitch';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { styled } from '@mui/material';

const StyledContainer = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    maxWidth: '350px',
    minWidth: '350px',
    marginRight: '1rem',
    marginTop: '1rem',
    [theme.breakpoints.down(1000)]: {
        marginBottom: '1rem',
        width: '100%',
        maxWidth: 'none',
        minWidth: 'auto',
    },
}));

const StyledHeader = styled('h3')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    fontSize: theme.fontSizes.bodySize,
    fontWeight: 'normal',
    margin: 0,
    marginBottom: '0.5rem',

    // Make the help icon align with the text.
    '& > :last-child': {
        position: 'relative',
        top: 1,
    },
}));

const FeatureOverviewEnvSwitches = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature } = useFeature(projectId, featureId);
    useFeatureApi();

    const [showInfoBox, setShowInfoBox] = useState(false);
    const [environmentName, setEnvironmentName] = useState('');

    const closeInfoBox = () => {
        setShowInfoBox(false);
    };

    const renderEnvironmentSwitches = () => {
        return feature?.environments.map(env => {
            return (
                <FeatureOverviewEnvSwitch
                    key={env.name}
                    env={env}
                    showInfoBox={() => {
                        setEnvironmentName(env.name);
                        setShowInfoBox(true);
                    }}
                />
            );
        });
    };

    return (
        <StyledContainer>
            <StyledHeader data-loading>
                Feature toggle status
                <HelpIcon
                    tooltip="When a feature is switched off in an environment, it will always return false. When switched on, it will return true or false depending on its strategies."
                    placement="top"
                />
            </StyledHeader>
            {renderEnvironmentSwitches()}
            <EnvironmentStrategyDialog
                open={showInfoBox}
                onClose={closeInfoBox}
                projectId={projectId}
                featureId={featureId}
                environmentName={environmentName}
            />
        </StyledContainer>
    );
};

export default FeatureOverviewEnvSwitches;
