import { Box, styled } from '@mui/material';
import { IChangeRequestUpdateStrategy } from 'component/changeRequest/changeRequest.types';
import { useUiFlag } from 'hooks/useUiFlag';
import { IFeatureStrategy } from 'interfaces/strategy';
import { getChangesThatWouldBeOverwritten } from './strategy-change-diff-calculation';

const ChangesToOverwriteWarning = styled(Box)(({ theme }) => ({
    color: theme.palette.warning.dark,
    backgroundColor: theme.palette.warning.light,
    fontSize: theme.fontSizes.smallBody,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

const OverwriteTable = styled('table')(({ theme }) => ({
    '&,td,tr,thead': {
        display: 'block',
        textAlign: 'margin-inline-start',
    },

    thead: {
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: '1px',
        overflow: 'hidden',
        position: 'absolute',
        whiteSpace: 'nowrap',
        width: '1px',
    },

    'tr + tr': {
        marginBlockStart: theme.spacing(2),
    },

    'td:first-of-type': {
        fontWeight: 'bold',
        '::after': {
            content: '":"',
        },
        textTransform: 'capitalize',
        fontSize: theme.fontSizes.bodySize,
    },
    'td + td::before': {
        content: 'attr(data-column)',
        marginInlineEnd: theme.spacing(1),
        fontWeight: 'bold',
    },

    pre: {
        background: theme.palette.background.default,
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        width: '100%',

        'ins, del': {
            textDecoration: 'none',
            'code::before': {
                marginInlineEnd: theme.spacing(1),
            },
        },
        'del code::before': {
            content: '"-"',
        },
        'ins code::before': {
            content: '"+"',
        },
    },
}));

export const ChangesToOverwrite: React.FC<{
    currentStrategy?: IFeatureStrategy;
    change: IChangeRequestUpdateStrategy;
}> = ({ change, currentStrategy }) => {
    const checkForChanges = useUiFlag('changeRequestConflictHandling');
    const changesThatWouldBeOverwritten = checkForChanges
        ? getChangesThatWouldBeOverwritten(currentStrategy, change)
        : null;

    if (!changesThatWouldBeOverwritten) {
        return null;
    }

    return (
        <ChangesToOverwriteWarning>
            <p>
                <strong>Heads up!</strong> The strategy has been updated since
                you made your changes. Applying this change now would overwrite
                the configuration that is currently live.
            </p>
            <details open>
                <summary>Changes that would be overwritten</summary>

                <OverwriteTable>
                    <thead>
                        <tr>
                            <th>Property</th>
                            <th>Current value</th>
                            <th>Value after change</th>
                        </tr>
                    </thead>

                    <tbody>
                        {changesThatWouldBeOverwritten.map(
                            ({ property, oldValue, newValue }) => (
                                <tr key={property}>
                                    <td data-column='Property'>{property}</td>
                                    <td data-column='Current value'>
                                        <pre>
                                            <del>
                                                {JSON.stringify(
                                                    oldValue,
                                                    null,
                                                    2,
                                                )
                                                    .split('\n')
                                                    .map((line, index) => (
                                                        <code key={index}>
                                                            {line + '\n'}
                                                        </code>
                                                    ))}
                                            </del>
                                        </pre>
                                    </td>
                                    <td data-column='Value after change'>
                                        <pre>
                                            <ins>
                                                {JSON.stringify(
                                                    newValue,
                                                    null,
                                                    2,
                                                )
                                                    .split('\n')
                                                    .map((line, index) => (
                                                        <code key={index}>
                                                            {line + '\n'}
                                                        </code>
                                                    ))}
                                            </ins>
                                        </pre>
                                    </td>
                                </tr>
                            ),
                        )}
                    </tbody>
                </OverwriteTable>
            </details>
        </ChangesToOverwriteWarning>
    );
};
