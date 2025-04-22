import { Box, styled } from '@mui/material';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { Sticky } from 'component/common/Sticky/Sticky';
import {
    type ITab,
    VerticalTabs,
} from 'component/common/VerticalTabs/VerticalTabs';
import EnvironmentIcon from 'component/common/EnvironmentIcon/EnvironmentIcon';
import { useEffect } from 'react';

const StyledContainer = styled(Box)(({ theme }) => ({
    margin: theme.spacing(2),
    marginLeft: 0,
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '350px',
    [theme.breakpoints.down('md')]: {
        width: '100%',
    },
}));

const StyledHeader = styled('h3')(({ theme }) => ({
    display: 'flex',
    fontSize: theme.fontSizes.bodySize,
    margin: 0,
    marginBottom: theme.spacing(1),
}));

const StyledVerticalTabs = styled(VerticalTabs)(({ theme }) => ({
    '&&& .selected': {
        backgroundColor: theme.palette.neutral.light,
    },
}));

interface IFeatureOverviewSidePanelProps {
    environmentId: string;
    setEnvironmentId: React.Dispatch<React.SetStateAction<string>>;
}

export const FeatureOverviewSidePanel = ({
    environmentId,
    setEnvironmentId,
}: IFeatureOverviewSidePanelProps) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature } = useFeature(projectId, featureId);
    const isSticky = feature.environments?.length <= 3;

    const tabs: ITab[] = feature.environments.map(
        ({ name, enabled, strategies }) => ({
            id: name,
            label: name,
            description:
                strategies.length === 1
                    ? '1 strategy'
                    : `${strategies.length || 'No'} strategies`,
            startIcon: <EnvironmentIcon enabled={enabled} />,
        }),
    );

    useEffect(() => {
        if (!environmentId) {
            setEnvironmentId(tabs[0]?.id);
        }
    }, [tabs]);

    return (
        <StyledContainer as={isSticky ? Sticky : Box}>
            <StyledHeader data-loading>
                Environments ({feature.environments.length})
            </StyledHeader>
            <StyledVerticalTabs
                tabs={tabs}
                value={environmentId}
                onChange={({ id }) => setEnvironmentId(id)}
            />
        </StyledContainer>
    );
};
