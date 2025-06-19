import { diff } from 'deep-diff';
import { type JSX, type CSSProperties, useState, type FC, useId } from 'react';
import { JsonDiffComponent, type JsonValue } from 'json-diff-react';
import { Button, styled, useTheme } from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag';

const DIFF_PREFIXES: Record<string, string> = {
    A: ' ',
    E: ' ',
    D: '-',
    N: '+',
};

interface IEventDiffResult {
    key: string;
    value: JSX.Element;
    index: number;
}

interface IEventDiffProps {
    entry: { data?: unknown; preData?: unknown };
    /**
     * @deprecated remove with flag improvedJsonDiff
     */
    sort?: (a: IEventDiffResult, b: IEventDiffResult) => number;
    excludeKeys?: string[];
}

const DiffStyles = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontFamily: 'monospace',
    whiteSpace: 'pre',
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

    '&:not([data-change-type="edit"]) :where(.addition, .deletion)::before': {
        content: 'none',
    },

    '.diff:not(:has(*))': {
        '::before': {
            content: '"(no changes)"',
        },
    },
}));

const ExpandButton = styled(Button)(({ theme }) => ({
    display: 'inline-flex',
    gap: theme.spacing(0.5),
}));

const NewEventDiff: FC<IEventDiffProps> = ({ entry, excludeKeys }) => {
    const changeType = entry.preData && entry.data ? 'edit' : undefined;
    const showExpandButton = changeType === 'edit';
    const [full, setFull] = useState(false);
    const diffId = useId();

    return (
        <>
            {showExpandButton ? (
                <ExpandButton
                    onClick={() => setFull(!full)}
                    aria-controls={diffId}
                    aria-expanded={full}
                >
                    <span aria-hidden>{full ? '-' : '+'}</span>
                    <span>
                        {full
                            ? 'Show only changed properties'
                            : 'Show all properties'}
                    </span>
                </ExpandButton>
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

const OldEventDiff: FC<IEventDiffProps> = ({
    entry,
    sort = (a, b) => a.key.localeCompare(b.key),
}: IEventDiffProps) => {
    const theme = useTheme();

    const styles: Record<string, CSSProperties> = {
        A: { color: theme.palette.eventLog.edited }, // array edited
        E: { color: theme.palette.eventLog.edited }, // edited
        D: { color: theme.palette.eventLog.diffSub }, // deleted
        N: { color: theme.palette.eventLog.diffAdd }, // added
    };

    const diffs =
        entry.data && entry.preData
            ? diff(entry.preData, entry.data)
            : undefined;

    const buildItemDiff = (diff: any, key: string) => {
        let change: JSX.Element | undefined;
        if (diff.lhs !== undefined) {
            change = (
                <div style={styles.D}>
                    - {key}: {JSON.stringify(diff.lhs)}
                </div>
            );
        } else if (diff.rhs !== undefined) {
            change = (
                <div style={styles.N}>
                    + {key}: {JSON.stringify(diff.rhs)}
                </div>
            );
        }

        return change;
    };

    const buildDiff = (diff: any, index: number): IEventDiffResult => {
        let change: JSX.Element | undefined;
        const key = diff.path?.join('.') ?? diff.index;

        if (diff.item) {
            change = buildItemDiff(diff.item, key);
        } else if (diff.lhs !== undefined && diff.rhs !== undefined) {
            change = (
                <div>
                    <div style={styles.D}>
                        - {key}: {JSON.stringify(diff.lhs)}
                    </div>
                    <div style={styles.N}>
                        + {key}: {JSON.stringify(diff.rhs)}
                    </div>
                </div>
            );
        } else {
            const changeValue = JSON.stringify(diff.rhs || diff.item);
            change = (
                <div style={styles[diff.kind]}>
                    {DIFF_PREFIXES[diff.kind]} {key}
                    {changeValue
                        ? `: ${changeValue}`
                        : diff.kind === 'D'
                          ? ' (deleted)'
                          : ''}
                </div>
            );
        }

        return {
            key: key.toString(),
            value: <div key={index}>{change}</div>,
            index,
        };
    };

    let changes: any[] = [];

    if (diffs) {
        changes = diffs
            .map(buildDiff)
            .sort(sort)
            .map(({ value }) => value);
    } else if (entry.data == null || entry.preData == null) {
        // Just show the data if there is no diff yet.
        const data = entry.data || entry.preData;
        changes = [
            <div key={0} style={entry.data ? styles.N : styles.D}>
                {JSON.stringify(data, null, 2)}
            </div>,
        ];
    }

    return (
        <pre style={{ overflowX: 'auto', overflowY: 'hidden' }}>
            <code>{changes.length === 0 ? '(no changes)' : changes}</code>
        </pre>
    );
};

const EventDiff: FC<IEventDiffProps> = (props) => {
    const useNewJsonDiff = useUiFlag('improvedJsonDiff');
    if (useNewJsonDiff) {
        return (
            <>
                <NewEventDiff {...props} />
                <hr />
                <OldEventDiff {...props} />
            </>
        );
    }
    return <OldEventDiff {...props} />;
};

export default EventDiff;
