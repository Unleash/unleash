import { styled, SxProps, Theme, useTheme } from '@mui/material';
import TimeAgo from 'react-timeago';
import { IEnvironments } from 'interfaces/featureToggle';
import React from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledDescription = styled(
    'div',
    {}
)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledDescriptionBlock = styled('div')({
    display: 'flex',
    flexDirection: 'row',
});

const StyledDescriptionHeader = styled('p')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(1),
}));

const StyledDescriptionBlockHeader = styled('p')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(1),
    width: '50%',
}));

const StyledDescriptionSubHeader = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    margin: theme.spacing(2, 0),
}));

interface ILastSeenTooltipProps {
    environments?: IEnvironments[];
    className?: string;
    sx?: SxProps<Theme>;
}

const useLastSeeneColor = () => {
    const theme = useTheme();

    return (unit?: string): string => {
        switch (unit) {
            case 'second':
                return theme.palette.success.main;
            case 'minute':
                return theme.palette.success.main;
            case 'hour':
                return theme.palette.success.main;
            case 'day':
                return theme.palette.success.main;
            case 'week':
                return theme.palette.warning.main;
            case 'month':
                return theme.palette.error.main;
            case 'year':
                return theme.palette.error.main;
            default:
                return theme.palette.grey.A400;
        }
    };
};

export const LastSeenTooltip = ({
    environments,
    ...rest
}: ILastSeenTooltipProps) => {
    const getColor = useLastSeeneColor();
    return (
        <StyledDescription {...rest}>
            <StyledDescriptionHeader sx={{ mb: 0 }}>
                Last usage reported
            </StyledDescriptionHeader>
            <StyledDescriptionSubHeader>
                Usage is reported from connected applications through metrics
            </StyledDescriptionSubHeader>
            {environments &&
                environments?.map(({ name, lastSeenAt }) => (
                    <StyledDescriptionBlock key={name}>
                        <StyledDescriptionBlockHeader>
                            {name}
                        </StyledDescriptionBlockHeader>
                        <ConditionallyRender
                            condition={Boolean(lastSeenAt)}
                            show={
                                <TimeAgo
                                    date={lastSeenAt!}
                                    title=""
                                    live={false}
                                    formatter={(
                                        value: number,
                                        unit: string,
                                        suffix: string
                                    ) => {
                                        return (
                                            <div
                                                style={{
                                                    color: getColor(unit),
                                                    textAlign: 'left',
                                                    width: '100%',
                                                }}
                                            >
                                                {`${value} ${unit}${
                                                    value !== 1 ? 's' : ''
                                                } ${suffix}`}
                                            </div>
                                        );
                                    }}
                                />
                            }
                            elseShow={
                                <div
                                    style={{
                                        color: getColor(),
                                    }}
                                >
                                    no usage
                                </div>
                            }
                        />
                    </StyledDescriptionBlock>
                ))}
        </StyledDescription>
    );
};
