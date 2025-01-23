import { getFeatureStrategyIcon } from 'utils/strategyNames';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { Link, styled } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { useReleasePlansApi } from 'hooks/api/actions/useReleasePlansApi/useReleasePlansApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useReleasePlans } from 'hooks/api/getters/useReleasePlans/useReleasePlans';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useUiFlag } from 'hooks/useUiFlag';

const StyledIcon = styled('div')(({ theme }) => ({
    width: theme.spacing(4),
    height: 'auto',
    '& > svg': {
        fill: theme.palette.primary.main,
    },
    '& > div': {
        height: theme.spacing(2),
        marginLeft: '-.75rem',
        color: theme.palette.primary.main,
    },
}));

const StyledDescription = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledName = styled(StringTruncator)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledCard = styled(Link)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '3rem 1fr',
    width: '20rem',
    padding: theme.spacing(2),
    color: 'inherit',
    textDecoration: 'inherit',
    lineHeight: 1.25,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
    borderRadius: theme.spacing(1),
    '&:hover, &:focus': {
        borderColor: theme.palette.primary.main,
    },
}));

interface IFeatureReleasePlanCardProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    releasePlanTemplate: IReleasePlanTemplate;
    setAddingTemplateId: (templateId: string) => void;
}

export const FeatureReleasePlanCard = ({
    projectId,
    featureId,
    environmentId,
    releasePlanTemplate,
    setAddingTemplateId,
}: IFeatureReleasePlanCardProps) => {
    const Icon = getFeatureStrategyIcon('releasePlanTemplate');
    const { trackEvent } = usePlausibleTracker();
    const { refetch } = useReleasePlans(projectId, featureId, environmentId);
    const { addReleasePlanToFeature } = useReleasePlansApi();
    const { setToastApiError, setToastData } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const releasePlanChangeRequestsEnabled = useUiFlag(
        'releasePlanChangeRequests',
    );

    const addReleasePlan = async () => {
        try {
            if (
                releasePlanChangeRequestsEnabled &&
                isChangeRequestConfigured(environmentId)
            ) {
                setAddingTemplateId(releasePlanTemplate.id);
            } else {
                await addReleasePlanToFeature(
                    featureId,
                    releasePlanTemplate.id,
                    projectId,
                    environmentId,
                );
                setToastData({
                    type: 'success',
                    text: 'Release plan added',
                });
                refetch();
            }
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }

        trackEvent('release-plans', {
            props: {
                eventType: 'add',
                name: releasePlanTemplate.name,
            },
        });
    };

    return (
        <StyledCard onClick={addReleasePlan}>
            <StyledIcon>
                <Icon />
            </StyledIcon>
            <div>
                <StyledName
                    text={releasePlanTemplate.name}
                    maxWidth='200'
                    maxLength={25}
                />
                <StyledDescription>
                    {releasePlanTemplate.description}
                </StyledDescription>
            </div>
        </StyledCard>
    );
};
