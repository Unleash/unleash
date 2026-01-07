import {
    parseParameterNumber,
    parseParameterStrings,
} from 'utils/parseParameter';
import { Box, styled } from '@mui/material';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import { PlaygroundParameterItem } from '../PlaygroundParameterItem/PlaygroundParameterItem.tsx';
import { StyledBoxSummary } from '../StrategyExecution.styles';
import type {
    PlaygroundConstraintSchema,
    PlaygroundRequestSchema,
} from 'openapi';
import { getMappedParam } from '../helpers.ts';
import { Badge } from 'component/common/Badge/Badge';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import DisabledPercentageCircle from 'component/common/PercentageCircle/DisabledPercentageCircle';

export interface PlaygroundResultStrategyExecutionParametersProps {
    parameters: { [key: string]: string };
    constraints: PlaygroundConstraintSchema[];
    input?: PlaygroundRequestSchema;
    disabled?: boolean;
}

const StyledText = styled('div', {
    shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled: boolean }>(({ theme, disabled }) => ({
    color: disabled ? theme.palette.text.secondary : theme.palette.neutral.main,
}));

export const PlaygroundResultStrategyExecutionParameters = ({
    parameters,
    constraints,
    input,
    disabled = false,
}: PlaygroundResultStrategyExecutionParametersProps) => {
    const stickiness = parameters?.stickiness;
    const explainStickiness =
        typeof stickiness === 'string' && stickiness !== 'default';
    return (
        <>
            {Object.keys(parameters).map((key) => {
                switch (key) {
                    case 'rollout':
                    case 'Rollout': {
                        const percentage = parseParameterNumber(
                            parameters[key],
                        );
                        return (
                            <StyledBoxSummary
                                key={key}
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                <Box
                                    sx={(theme) => ({
                                        mr: '1rem',
                                        color: disabled
                                            ? theme.palette.neutral.border
                                            : theme.palette.text.secondary,
                                    })}
                                >
                                    <ConditionallyRender
                                        condition={disabled}
                                        show={
                                            <DisabledPercentageCircle
                                                percentage={percentage}
                                                size='2rem'
                                            />
                                        }
                                        elseShow={
                                            <PercentageCircle
                                                percentage={percentage}
                                                size='2rem'
                                            />
                                        }
                                    />
                                </Box>
                                <StyledText disabled={disabled}>
                                    <Badge
                                        color={
                                            disabled ? 'disabled' : 'success'
                                        }
                                    >
                                        {percentage}%
                                    </Badge>{' '}
                                    of your base{' '}
                                    <span>
                                        {explainStickiness ? (
                                            <>
                                                with{' '}
                                                <strong>{stickiness}</strong>
                                            </>
                                        ) : (
                                            ''
                                        )}{' '}
                                    </span>
                                    {constraints.length > 0
                                        ? 'who match constraints'
                                        : ''}{' '}
                                    is included.
                                </StyledText>
                            </StyledBoxSummary>
                        );
                    }
                    case 'userIds':
                    case 'UserIds': {
                        const users = parseParameterStrings(parameters[key]);
                        return (
                            <PlaygroundParameterItem
                                key={key}
                                value={users}
                                text='user'
                                input={
                                    input?.context?.[getMappedParam(key)]
                                        ? (input?.context?.[
                                              getMappedParam(key)
                                          ] as string)
                                        : 'no value'
                                }
                                showReason={
                                    input?.context?.[getMappedParam(key)]
                                        ? !users.includes(
                                              input?.context?.[
                                                  getMappedParam(key)
                                              ] as string,
                                          )
                                        : undefined
                                }
                            />
                        );
                    }
                    case 'hostNames':
                    case 'HostNames': {
                        const hosts = parseParameterStrings(parameters[key]);
                        return (
                            <PlaygroundParameterItem
                                key={key}
                                value={hosts}
                                text={'host'}
                                input={'no value'}
                                showReason={undefined}
                                disabled={disabled}
                            />
                        );
                    }
                    case 'IPs': {
                        const IPs = parseParameterStrings(parameters[key]);
                        return (
                            <PlaygroundParameterItem
                                key={key}
                                value={IPs}
                                text={'IP'}
                                disabled={disabled}
                                input={
                                    input?.context?.[getMappedParam(key)]
                                        ? (input?.context?.[
                                              getMappedParam(key)
                                          ] as string)
                                        : 'no value'
                                }
                                showReason={
                                    input?.context?.[getMappedParam(key)]
                                        ? !IPs.includes(
                                              input?.context?.[
                                                  getMappedParam(key)
                                              ] as string,
                                          )
                                        : undefined
                                }
                            />
                        );
                    }
                    case 'stickiness':
                    case 'groupId':
                        return null;
                    default:
                        return null;
                }
            })}
        </>
    );
};
