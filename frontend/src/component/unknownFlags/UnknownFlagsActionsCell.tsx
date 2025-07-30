import { Box, styled } from '@mui/material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import EventNoteIcon from '@mui/icons-material/EventNote';
import type { UnknownFlag } from './hooks/useUnknownFlags.js';
import { Link } from 'react-router-dom';

const StyledBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
}));

interface IUnknownFlagsActionsCellProps {
    unknownFlag: UnknownFlag;
}

export const UnknownFlagsActionsCell = ({
    unknownFlag,
}: IUnknownFlagsActionsCellProps) => (
    <StyledBox>
        <PermissionIconButton
            component={Link}
            data-loading
            to={`/history?feature=${encodeURIComponent(`IS:${unknownFlag.name}`)}`}
            permission={ADMIN}
            tooltipProps={{
                title: 'See events',
            }}
        >
            <EventNoteIcon />
        </PermissionIconButton>
    </StyledBox>
);
