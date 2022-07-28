import { PlaygroundFeatureSchema } from '../../../../../hooks/api/actions/usePlayground/playground.model';
import { Box, IconButton, Popover } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { IconCell } from '../../../../common/Table/cells/IconCell/IconCell';
import React, { useRef, useState } from 'react';

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
    const ref = useRef(null);

    const togglePopover = (event: React.SyntheticEvent) => {
        setOpen(!open);
    };

    const strategies = [
        {
            type: 'standard',
            id: 'strategy-id',
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
        {
            type: 'default',
            result: true,
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
            >
                {feature.name}
            </Popover>
        </>
    );
};
