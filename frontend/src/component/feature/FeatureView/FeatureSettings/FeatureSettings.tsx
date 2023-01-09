import { useState } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import { Box, List, ListItem, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import FeatureSettingsProject from './FeatureSettingsProject/FeatureSettingsProject';
import { FeatureSettingsInformation } from './FeatureSettingsInformation/FeatureSettingsInformation';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const METADATA = 'metadata';
const PROJECT = 'project';

const StyledListContainer = styled('div')(({ theme }) => ({
    width: '20%',
    borderRight: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2, 0),
    [theme.breakpoints.down('md')]: {
        width: '35%',
    },
}));

const StyledInnerBodyContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    width: 400,
    ['& > *']: {
        margin: theme.spacing(1, 0),
    },
}));

export const FeatureSettings = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const [settings, setSettings] = useState(METADATA);
    const { uiConfig } = useUiConfig();

    return (
        <PageContent header="Settings" sx={{ padding: 0 }}>
            <Box sx={{ display: 'flex' }}>
                <StyledListContainer>
                    <List>
                        <ListItem
                            key={0}
                            sx={{ padding: '0.75rem 2rem' }}
                            button
                            onClick={() => setSettings(METADATA)}
                            selected={settings === METADATA}
                        >
                            Metadata
                        </ListItem>
                        <ListItem
                            key={1}
                            sx={{ padding: '0.75rem 2rem' }}
                            button
                            onClick={() => setSettings(PROJECT)}
                            selected={settings === PROJECT}
                            hidden={!uiConfig.flags.P}
                        >
                            Project
                        </ListItem>
                    </List>
                </StyledListContainer>
                <StyledInnerBodyContainer>
                    <ConditionallyRender
                        condition={settings === METADATA}
                        show={
                            <FeatureSettingsInformation
                                projectId={projectId}
                                featureId={featureId}
                            />
                        }
                    />
                    <ConditionallyRender
                        condition={settings === PROJECT && uiConfig.flags.P}
                        show={<FeatureSettingsProject />}
                    />
                </StyledInnerBodyContainer>
            </Box>
        </PageContent>
    );
};
