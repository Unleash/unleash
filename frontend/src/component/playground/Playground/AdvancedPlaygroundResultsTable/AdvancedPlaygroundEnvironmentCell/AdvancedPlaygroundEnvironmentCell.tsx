import { AdvancedPlaygroundEnvironment } from '../advancedPlayground';
import { ConditionallyRender } from '../../../../common/ConditionallyRender/ConditionallyRender';
import { IconButton, Popover, styled, useTheme } from '@mui/material';
import { flexRow } from '../../../../../themes/themeStyles';
import { PlaygroundResultChip } from '../../PlaygroundResultsTable/PlaygroundResultChip/PlaygroundResultChip';
import { InfoOutlined } from '@mui/icons-material';
import React, { useState } from 'react';
import { AdvancedPlaygroundEnvironmentEvaluationDetails } from '../AdvancedPlaygroundEnvironmentEvaluationDetails/AdvancedPlaygroundEnvironmentEvaluationDetails';

const SyledContainer = styled(
    'div',
    {}
)(({ theme }) => ({
    flexGrow: 0,
    ...flexRow,
    justifyContent: 'center',
    '::before': {
        content: '""',
        display: 'block',
        width: theme.spacing(2),
    },
}));

export interface IAdvancedPlaygroundEnvironmentCellProps {
    value: AdvancedPlaygroundEnvironment;
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

    const enabled = value?.filter(evaluation => evaluation.isEnabled) || [];
    const disabled = value?.filter(evaluation => !evaluation.isEnabled) || [];

    return (
        <SyledContainer>
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
                        },
                    }}
                    onClose={onClose}
                    anchorEl={anchor}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: -320,
                    }}
                >
                    <AdvancedPlaygroundEnvironmentEvaluationDetails
                        environment={value}
                    />
                </Popover>
            </>
        </SyledContainer>
    );
};
