import { Chip, styled } from '@mui/material';
import AccessContext from 'contexts/AccessContext';
import { useSignalEndpoints } from 'hooks/api/getters/useSignalEndpoints/useSignalEndpoints';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { useContext } from 'react';
import { useEventTimelineContext } from '../EventTimelineContext';
import { Link, useNavigate } from 'react-router-dom';
import SensorsIcon from '@mui/icons-material/Sensors';

const StyledTip = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

const StyledSignalIcon = styled(SensorsIcon)(({ theme }) => ({
    '&&&': {
        color: theme.palette.primary.main,
    },
}));

const signalsLink = '/integrations/signals';

export const EventTimelineHeaderTip = () => {
    const navigate = useNavigate();
    const { signalsSuggestionSeen, setSignalsSuggestionSeen } =
        useEventTimelineContext();

    const { isEnterprise } = useUiConfig();
    const { isAdmin } = useContext(AccessContext);
    const signalsEnabled = useUiFlag('signals');
    const { signalEndpoints, loading } = useSignalEndpoints();

    if (
        !signalsSuggestionSeen &&
        isEnterprise() &&
        isAdmin &&
        signalsEnabled &&
        !loading &&
        signalEndpoints.length === 0
    ) {
        return (
            <StyledTip>
                <Chip
                    size='small'
                    icon={<StyledSignalIcon />}
                    label={
                        <>
                            See <Link to={signalsLink}>signals</Link> from
                            external sources in real-time within Unleash
                        </>
                    }
                    onClick={() => navigate(signalsLink)}
                    onDelete={() => setSignalsSuggestionSeen(true)}
                />
            </StyledTip>
        );
    }

    return null;
};
