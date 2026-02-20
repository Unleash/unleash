import type { FC } from 'react';
import { styled, Typography } from '@mui/material';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { FeatureLifecycleStageIcon } from 'component/common/FeatureLifecycle/FeatureLifecycleStageIcon';
import { getFeatureLifecycleName } from 'component/common/FeatureLifecycle/getFeatureLifecycleName';
import { populateCurrentStage } from '../FeatureOverview/FeatureLifecycle/populateCurrentStage';
import { formatDistanceToNow, parseISO } from 'date-fns';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2, 3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
}));

const StyledLifecycleSection = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledLifecycleText = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.primary,
}));

const StyledDivider = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    margin: `0 ${theme.spacing(1)}`,
}));

const StyledTimeInfo = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

interface FeatureStoryHeaderProps {
    feature: IFeatureToggle;
}

export const FeatureStoryHeader: FC<FeatureStoryHeaderProps> = ({
    feature,
}) => {
    const currentStage = populateCurrentStage(feature);
    const createdAt = feature.createdAt
        ? formatDistanceToNow(parseISO(feature.createdAt), { addSuffix: true })
        : null;

    const lastSeenAt = feature.lastSeenAt
        ? formatDistanceToNow(parseISO(feature.lastSeenAt), { addSuffix: true })
        : null;

    return (
        <StyledContainer>
            {currentStage && (
                <StyledLifecycleSection>
                    <FeatureLifecycleStageIcon stage={currentStage} />
                    <StyledLifecycleText variant='body1'>
                        {getFeatureLifecycleName(currentStage.name)}
                    </StyledLifecycleText>
                </StyledLifecycleSection>
            )}
            <StyledTimeInfo>
                {createdAt && (
                    <>
                        Created {createdAt}
                        {lastSeenAt && (
                            <>
                                <StyledDivider>•</StyledDivider>
                                Last evaluated {lastSeenAt}
                            </>
                        )}
                    </>
                )}
            </StyledTimeInfo>
        </StyledContainer>
    );
};
