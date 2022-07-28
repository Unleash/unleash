import {
    PlaygroundFeatureSchema,
    PlaygroundFeatureStrategyResult,
} from '../../../../../hooks/api/actions/usePlayground/playground.model';
import { Box, IconButton, Popover, Typography } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { IconCell } from '../../../../common/Table/cells/IconCell/IconCell';
import React, { useRef, useState } from 'react';
import { ConditionallyRender } from '../../../../common/ConditionallyRender/ConditionallyRender';
import { StrategyDraggableItem } from '../../../../feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyDraggableItem';
import { FeatureStrategyEmpty } from '../../../../feature/FeatureStrategy/FeatureStrategyEmpty/FeatureStrategyEmpty';
import { PlaygroundResultFeatureStrategyItem } from './PlaygroundResultFeatureStrategyItem/PlaygroundResultFeatureStrategyItem';
import { useStyles } from './FeatureResultInfoPopoverCell.styles';
import { PlaygroundResultFeatureDetails } from './PlaygroundResultFeatureDetails/PlaygroundResultFeatureDetails';

interface FeatureResultInfoPopoverCellProps {
    feature?: PlaygroundFeatureSchema;
}

export const FeatureResultInfoPopoverCell = ({
    feature,
}: FeatureResultInfoPopoverCellProps) => {
    if (!feature) {
        return null;
    }
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
            result: false,
            constraints: [
                {
                    result: false,
                    contextName: 'appName',
                    operator: 'IN',
                    caseInsensitive: true,
                    inverted: false,
                    values: ['a', 'b'],
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
                            contextName: 'appName',
                            operator: 'IN',
                            caseInsensitive: true,
                            inverted: false,
                            values: ['a', 'b'],
                        },
                    ],
                },
            ],
        },
    ];

    return (
        <>
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
                                variant={'subtitle2'}
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
        </>
    );
};
