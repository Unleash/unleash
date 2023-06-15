import { ConditionallyRender } from '../../../../common/ConditionallyRender/ConditionallyRender';
import {
    Box,
    IconButton,
    Popover,
    styled,
    Typography,
    useTheme,
} from '@mui/material';
import { flexRow } from '../../../../../themes/themeStyles';
import { PlaygroundResultChip } from '../../PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip';
import { InfoOutlined } from '@mui/icons-material';
import React, { useState } from 'react';
import { AdvancedPlaygroundEnvironmentFeatureSchema } from 'openapi';
import { PlaygroundEnvironmentTable } from '../../PlaygroundEnvironmentTable/PlaygroundEnvironmentTable';

const StyledContainer = styled(
    'div',
    {}
)(({ theme }) => ({
    flexGrow: 0,
    ...flexRow,
    justifyContent: 'flex-start',
    margin: theme.spacing(0, 1.5),
}));

const StyledPlaygroundChipContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
}));

export interface IAdvancedPlaygroundEnvironmentCellProps {
    value: AdvancedPlaygroundEnvironmentFeatureSchema[];
}

export const AdvancedPlaygroundEnvironmentCell = ({
    value,
}: IAdvancedPlaygroundEnvironmentCellProps) => {
    const theme = useTheme();
    const [anchor, setAnchorEl] = useState<null | Element>(null);

    const onOpen = (event: React.FormEvent<HTMLButtonElement>) =>
        setAnchorEl(event.currentTarget);

    const onClose = () => setAnchorEl(null);

    const open = Boolean(anchor);

    const enabled = (value || []).filter(evaluation => evaluation.isEnabled);
    const disabled = (value || []).filter(evaluation => !evaluation.isEnabled);

    return (
        <StyledContainer>
            <StyledPlaygroundChipContainer>
                <ConditionallyRender
                    condition={enabled.length > 0}
                    show={
                        <PlaygroundResultChip
                            enabled={true}
                            label={`${enabled.length}`}
                            showIcon={true}
                        />
                    }
                />
                <ConditionallyRender
                    condition={disabled.length > 0}
                    show={
                        <PlaygroundResultChip
                            enabled={false}
                            label={`${disabled.length}`}
                            showIcon={true}
                        />
                    }
                />
            </StyledPlaygroundChipContainer>
            <>
                <IconButton onClick={onOpen}>
                    <InfoOutlined />
                </IconButton>

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
                        {value[0].environment}
                    </Typography>
                    <PlaygroundEnvironmentTable features={value} />
                </Popover>
            </>
        </StyledContainer>
    );
};
