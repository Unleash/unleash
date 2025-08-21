import { useState, type FC, useId } from 'react';
import { JsonDiffComponent, type JsonValue } from 'json-diff-react';
import { Button, styled } from '@mui/material';

interface IEventDiffProps {
    entry: { data?: unknown; preData?: unknown };
    excludeKeys?: string[];
}

const DiffStyles = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    fontSize: theme.typography.body2.fontSize,

    '.deletion, .addition': {
        position: 'relative',
        '::before': {
            position: 'absolute',
            left: 0,
            top: 0,
        },
    },

    '.addition': {
        color: theme.palette.eventLog.diffAdd,
        '::before': {
            content: '"+"',
        },
    },

    '.deletion': {
        color: theme.palette.eventLog.diffSub,
        '::before': {
            content: '"-"',
        },
    },

    '&[data-change-type="replacement"]': {
        ':has(.addition)': {
            color: theme.palette.eventLog.diffAdd,
        },
        ':has(.deletion)': {
            color: theme.palette.eventLog.diffSub,
        },
        '.addition::before, .deletion::before': {
            content: 'none',
        },
    },

    '.diff:not(:has(*))': {
        '::before': {
            content: '"(no changes)"',
        },
    },
}));

const ButtonIcon = styled('span')(({ theme }) => ({
    marginInlineEnd: theme.spacing(0.5),
}));

export const EventDiff: FC<IEventDiffProps> = ({ entry, excludeKeys }) => {
    const changeType = entry.preData && entry.data ? 'edit' : 'replacement';
    const showExpandButton = changeType === 'edit';
    const [full, setFull] = useState(false);
    const diffId = useId();

    return (
        <>
            {showExpandButton ? (
                <Button
                    onClick={() => setFull(!full)}
                    aria-controls={diffId}
                    aria-expanded={full}
                >
                    <ButtonIcon aria-hidden>{full ? '-' : '+'}</ButtonIcon>
                    {full
                        ? 'Show only changed properties'
                        : 'Show all properties'}
                </Button>
            ) : null}
            <DiffStyles data-change-type={changeType} id={diffId}>
                <JsonDiffComponent
                    jsonA={(entry.preData ?? {}) as JsonValue}
                    jsonB={(entry.data ?? {}) as JsonValue}
                    jsonDiffOptions={{
                        full: full,
                        maxElisions: 2,
                        excludeKeys: excludeKeys,
                    }}
                />
            </DiffStyles>
        </>
    );
};
