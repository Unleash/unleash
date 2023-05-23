import { FC } from 'react';
import { Box, Paper, styled, Typography } from '@mui/material';
import { BATCH_ACTIONS_BAR, BATCH_SELECTED_COUNT } from 'utils/testIds';

interface IBatchSelectionActionsBarProps {
    count: number;
}

const StyledStickyContainer = styled('div')(({ theme }) => ({
    position: 'sticky',
    marginTop: 'auto',
    bottom: 0,
    zIndex: theme.zIndex.mobileStepper,
    pointerEvents: 'none',
}));

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'wrap',
    paddingBottom: theme.spacing(2),
}));

const StyledBar = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: theme.spacing(2, 3),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.background.alternative}`,
    borderRadius: theme.shape.borderRadiusLarge,
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    pointerEvents: 'auto',
}));

const StyledCount = styled('span')(({ theme }) => ({
    background: theme.palette.background.alternative,
    color: theme.palette.common.white,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
}));

const StyledText = styled(Typography)(({ theme }) => ({
    paddingRight: theme.spacing(2),
    marginRight: 'auto',
}));

export const BatchSelectionActionsBar: FC<IBatchSelectionActionsBarProps> = ({
    count,
    children,
}) => {
    if (count === 0) {
        return null;
    }

    return (
        <StyledStickyContainer data-testid={BATCH_ACTIONS_BAR}>
            <StyledContainer>
                <StyledBar elevation={4}>
                    <StyledText>
                        <StyledCount data-testid={BATCH_SELECTED_COUNT}>
                            {count}
                        </StyledCount>
                        &ensp;selected
                    </StyledText>
                    {children}
                </StyledBar>
            </StyledContainer>
        </StyledStickyContainer>
    );
};
