import { Link, Popover, styled, Typography, useTheme } from '@mui/material';
import { flexRow } from '../../../../../themes/themeStyles';
import React, { useState } from 'react';
import { AdvancedPlaygroundFeatureSchemaEnvironments } from 'openapi';
import { PlaygroundEnvironmentDiffTable } from '../../PlaygroundEnvironmentTable/PlaygroundEnvironmentDiffTable';

const StyledContainer = styled(
    'div',
    {}
)(({ theme }) => ({
    flexGrow: 0,
    ...flexRow,
    justifyContent: 'flex-start',
    margin: theme.spacing(0, 1.5),
}));

const StyledButton = styled(Link)(({ theme }) => ({
    textAlign: 'left',
    textDecorationStyle: 'dotted',
    textUnderlineOffset: theme.spacing(0.75),
    color: theme.palette.neutral.dark,
}));

export interface IAdvancedPlaygroundEnvironmentCellProps {
    value: AdvancedPlaygroundFeatureSchemaEnvironments;
}

export const AdvancedPlaygroundEnvironmentDiffCell = ({
    value,
}: IAdvancedPlaygroundEnvironmentCellProps) => {
    const theme = useTheme();
    const [anchor, setAnchorEl] = useState<null | Element>(null);

    const onOpen = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>
        setAnchorEl(event.currentTarget);

    const onClose = () => setAnchorEl(null);

    const open = Boolean(anchor);

    return (
        <StyledContainer>
            <>
                <StyledButton variant={'body2'} onClick={onOpen}>
                    Preview diff
                </StyledButton>

                <Popover
                    open={open}
                    id={`${value}-result-details`}
                    PaperProps={{
                        sx: {
                            borderRadius: `${theme.shape.borderRadiusLarge}px`,
                            padding: theme.spacing(3),
                        },
                    }}
                    onClose={onClose}
                    anchorEl={anchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: -320,
                    }}
                >
                    <Typography variant="subtitle2" sx={{ mb: 3 }}>
                        Environments diff
                    </Typography>
                    <PlaygroundEnvironmentDiffTable features={value} />
                </Popover>
            </>
        </StyledContainer>
    );
};
