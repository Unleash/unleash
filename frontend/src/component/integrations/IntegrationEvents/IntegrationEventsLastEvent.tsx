import type { AddonSchema } from 'openapi';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { useIntegrationEvents } from 'hooks/api/getters/useIntegrationEvents/useIntegrationEvents';
import { IntegrationEventsDetails } from './IntegrationEventsDetails/IntegrationEventsDetails.tsx';
import { Box, type BoxProps, styled } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHMS } from 'utils/formatDate';
import { IntegrationEventsStateIcon } from './IntegrationEventsStateIcon.tsx';

const StyledTooltipLink = styled(TooltipLink)({
    display: 'flex',
    alignItems: 'center',
});

const StyledTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: theme.spacing(0, 2),
    marginTop: theme.spacing(2),
}));

const StyledLastEventSpan = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
}));

interface IIntegrationEventsLastEventProps extends BoxProps {
    integration?: AddonSchema;
}

export const IntegrationEventsLastEvent = ({
    integration,
    ...props
}: IIntegrationEventsLastEventProps) => {
    const { integrationEvents } = useIntegrationEvents(integration?.id, 1, {
        refreshInterval: 5000,
    });
    const { locationSettings } = useLocationSettings();

    if (integrationEvents.length === 0) {
        return null;
    }

    const integrationEvent = integrationEvents[0];

    return (
        <Box onClick={(e) => e.preventDefault()} {...props}>
            <StyledTooltipLink
                tooltipProps={{
                    maxWidth: 500,
                    maxHeight: 600,
                }}
                tooltip={
                    <>
                        <StyledTitle>
                            <StyledLastEventSpan>
                                Last event
                            </StyledLastEventSpan>
                            <span>
                                {formatDateYMDHMS(
                                    integrationEvent.createdAt,
                                    locationSettings?.locale,
                                )}
                            </span>
                        </StyledTitle>
                        <IntegrationEventsDetails {...integrationEvent} />
                    </>
                }
            >
                <IntegrationEventsStateIcon {...integrationEvent} />
            </StyledTooltipLink>
        </Box>
    );
};
