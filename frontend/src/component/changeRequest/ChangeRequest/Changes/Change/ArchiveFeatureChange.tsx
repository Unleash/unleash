import { ReactNode, VFC } from 'react';
import { Box, styled } from '@mui/material';
import { ChangeItemWrapper } from './StrategyChange';

interface IArchiveFeatureChange {
    actions?: ReactNode;
}

const ArchiveBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.error.main,
}));

export const ArchiveFeatureChange: VFC<IArchiveFeatureChange> = ({
    actions,
}) => {
    return (
        <ChangeItemWrapper>
            <ArchiveBox>Archiving feature</ArchiveBox>
            {actions}
        </ChangeItemWrapper>
    );
};
