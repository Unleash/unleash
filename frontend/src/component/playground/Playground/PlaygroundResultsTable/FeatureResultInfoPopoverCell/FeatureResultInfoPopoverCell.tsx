import {
    PlaygroundFeatureSchema,
    PlaygroundFeatureStrategyResult,
} from '../../../../../hooks/api/actions/usePlayground/playground.model';
import { IconButton, Popover, styled, Typography } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import React, { useRef, useState } from 'react';
import { ConditionallyRender } from '../../../../common/ConditionallyRender/ConditionallyRender';
import { PlaygroundResultFeatureStrategyItem } from './PlaygroundResultFeatureStrategyItem/PlaygroundResultFeatureStrategyItem';
import { useStyles } from './FeatureResultInfoPopoverCell.styles';
import { PlaygroundResultFeatureDetails } from './PlaygroundResultFeatureDetails/PlaygroundResultFeatureDetails';

interface FeatureResultInfoPopoverCellProps {
    feature?: PlaygroundFeatureSchema;
}

const FeatureResultPopoverWrapper = styled('div')(({ theme }) => ({
    alignItems: 'flex-end',
    color: theme.palette.tertiary.main,
}));

export const FeatureResultInfoPopoverCell = ({
    feature,
}: FeatureResultInfoPopoverCellProps) => {
    const [open, setOpen] = useState(false);
    const { classes: styles } = useStyles();
    const ref = useRef(null);

    const togglePopover = (event: React.SyntheticEvent) => {
        setOpen(!open);
    };

    const strategies: PlaygroundFeatureStrategyResult[] = [
        {
            name: 'default',
            id: 'strategy-id',
            parameters: {},
            result: true,
            constraints: [
                {
                    result: false,
                    contextName: 'appName',
                    operator: 'IN',
                    caseInsensitive: true,
                    inverted: false,
                    values: [
                        'a',
                        'b',
                        'sdlghigoiahr;g',
                        'WOGIHwegoihwlwEGHLwgklWEGK;L',
                    ],
                },
            ],
            segments: [
                {
                    result: true,
                    id: 5,
                    name: 'my-segment',
                    constraints: [
                        {
                            result: false,
                            contextName: 'environment',
                            operator: 'IN',
                            caseInsensitive: false,
                            inverted: false,
                            values: ['a', 'b'],
                        },
                    ],
                },
            ],
        },
    ];

    if (!feature) {
        return null;
    }

    return (
        <FeatureResultPopoverWrapper>
            <IconButton onClick={togglePopover}>
                <InfoOutlined ref={ref} />
            </IconButton>
            <Popover
                open={open}
                onClose={() => setOpen(false)}
                anchorEl={ref.current}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
                classes={{ paper: styles.popoverPaper }}
            >
                <PlaygroundResultFeatureDetails feature={feature} />
                <ConditionallyRender
                    condition={strategies.length > 0}
                    show={
                        <>
                            <Typography
                                variant={'subtitle1'}
                            >{`Strategies (${strategies.length})`}</Typography>
                            {strategies.map((strategy, index) => (
                                <PlaygroundResultFeatureStrategyItem
                                    key={strategy.id}
                                    strategy={strategy}
                                    index={index}
                                />
                            ))}
                        </>
                    }
                />
            </Popover>
        </FeatureResultPopoverWrapper>
    );
};
