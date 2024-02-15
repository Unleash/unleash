import { Box, styled } from '@mui/material';
import { useChangeRequestPlausibleContext } from 'component/changeRequest/ChangeRequestContext';
import {
    IChangeRequestPatchVariant,
    IChangeRequestUpdateSegment,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { useUiFlag } from 'hooks/useUiFlag';
import { ISegment } from 'interfaces/segment';
import { IFeatureStrategy } from 'interfaces/strategy';
import {
    ChangesThatWouldBeOverwritten,
    getEnvVariantChangesThatWouldBeOverwritten,
    getStrategyChangesThatWouldBeOverwritten,
    getSegmentChangesThatWouldBeOverwritten,
} from './strategy-change-diff-calculation';
import { useEffect } from 'react';
import { IFeatureVariant } from 'interfaces/featureToggle';

const ChangesToOverwriteContainer = styled(Box)(({ theme }) => ({
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

const DetailsTable: React.FC<{
    changesThatWouldBeOverwritten: ChangesThatWouldBeOverwritten;
}> = ({ changesThatWouldBeOverwritten }) => {
    return (
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
                                        {JSON.stringify(oldValue, null, 2)
                                            .split('\n')
                                            .map((line, index) => (
                                                <code
                                                    key={`${property}${line}${index}`}
                                                >
                                                    {`${line}\n`}
                                                </code>
                                            ))}
                                    </del>
                                </pre>
                            </td>
                            <td data-column='Value after change'>
                                <pre>
                                    <ins>
                                        {JSON.stringify(newValue, null, 2)
                                            .split('\n')
                                            .map((line, index) => (
                                                <code
                                                    key={`${property}${line}${index}`}
                                                >
                                                    {`${line}\n`}
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
    );
};

const OverwriteWarning: React.FC<{
    changeType: 'segment' | 'strategy' | 'environment variant configuration';
    changesThatWouldBeOverwritten: ChangesThatWouldBeOverwritten;
}> = ({ changeType, changesThatWouldBeOverwritten }) => {
    return (
        <ChangesToOverwriteContainer>
            <p>
                <strong>Heads up!</strong> The {changeType} has been updated
                since you made your changes. Applying this change now would
                overwrite the configuration that is currently live.
            </p>
            <details>
                <summary>Changes that would be overwritten</summary>
                <DetailsTable
                    changesThatWouldBeOverwritten={
                        changesThatWouldBeOverwritten
                    }
                />
            </details>
        </ChangesToOverwriteContainer>
    );
};

export const EnvVariantChangesToOverwrite: React.FC<{
    currentVariants?: IFeatureVariant[];
    change: IChangeRequestPatchVariant;
}> = ({ change, currentVariants }) => {
    const checkForChanges = useUiFlag('changeRequestConflictHandling');
    const changesThatWouldBeOverwritten = checkForChanges
        ? getEnvVariantChangesThatWouldBeOverwritten(currentVariants, change)
        : null;

    if (!changesThatWouldBeOverwritten) {
        return null;
    }

    return (
        <OverwriteWarning
            changeType='environment variant configuration'
            changesThatWouldBeOverwritten={changesThatWouldBeOverwritten}
        />
    );
};

export const SegmentChangesToOverwrite: React.FC<{
    currentSegment?: ISegment;
    change: IChangeRequestUpdateSegment;
}> = ({ change, currentSegment }) => {
    const checkForChanges = useUiFlag('changeRequestConflictHandling');
    const changesThatWouldBeOverwritten = checkForChanges
        ? getSegmentChangesThatWouldBeOverwritten(currentSegment, change)
        : null;

    if (!changesThatWouldBeOverwritten) {
        return null;
    }

    return (
        <OverwriteWarning
            changeType='segment'
            changesThatWouldBeOverwritten={changesThatWouldBeOverwritten}
        />
    );
};

export const StrategyChangesToOverwrite: React.FC<{
    currentStrategy?: IFeatureStrategy;
    change: IChangeRequestUpdateStrategy;
}> = ({ change, currentStrategy }) => {
    const checkForChanges = useUiFlag('changeRequestConflictHandling');
    const changesThatWouldBeOverwritten = checkForChanges
        ? getStrategyChangesThatWouldBeOverwritten(currentStrategy, change)
        : null;
    const { registerWillOverwriteStrategyChanges } =
        useChangeRequestPlausibleContext();

    useEffect(() => {
        if (changesThatWouldBeOverwritten) {
            registerWillOverwriteStrategyChanges();
        }
    }, [changesThatWouldBeOverwritten]);

    if (!changesThatWouldBeOverwritten) {
        return null;
    }

    return (
        <OverwriteWarning
            changeType='strategy'
            changesThatWouldBeOverwritten={changesThatWouldBeOverwritten}
        />
    );
};
