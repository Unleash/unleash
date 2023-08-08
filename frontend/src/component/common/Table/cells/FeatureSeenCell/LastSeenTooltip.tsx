import { styled, SxProps, Theme } from '@mui/material';
import TimeAgo from 'react-timeago';
import { IEnvironments } from 'interfaces/featureToggle';
import React from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useLastSeenColors } from './useLastSeenColors';

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

const StyledValueContainer = styled('div')({
    width: '50%',
});

const StyledValue = styled('div', {
    shouldForwardProp: prop => prop !== 'color',
})(({ color }) => ({
    textAlign: 'left',
    width: '100%',
    color: color,
}));

interface ILastSeenTooltipProps {
    environments?: IEnvironments[];
    className?: string;
    sx?: SxProps<Theme>;
}

export const LastSeenTooltip = ({
    environments,
    ...rest
}: ILastSeenTooltipProps) => {
    const getColor = useLastSeenColors();
    const [defaultColor] = getColor();
    return (
        <StyledDescription {...rest}>
            <StyledDescriptionHeader sx={{ mb: 0 }}>
                Last usage reported
            </StyledDescriptionHeader>
            <StyledDescriptionSubHeader>
                Usage is reported from connected applications through metrics
            </StyledDescriptionSubHeader>
            {environments &&
                environments.map(({ name, lastSeenAt }) => (
                    <StyledDescriptionBlock key={name}>
                        <StyledDescriptionBlockHeader>
                            {name}
                        </StyledDescriptionBlockHeader>
                        <StyledValueContainer>
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
                                            const [, textColor] =
                                                getColor(unit);
                                            return (
                                                <StyledValue color={textColor}>
                                                    {`${value} ${unit}${
                                                        value !== 1 ? 's' : ''
                                                    } ${suffix}`}
                                                </StyledValue>
                                            );
                                        }}
                                    />
                                }
                                elseShow={
                                    <StyledValue color={defaultColor}>
                                        no usage
                                    </StyledValue>
                                }
                            />
                        </StyledValueContainer>
                    </StyledDescriptionBlock>
                ))}
        </StyledDescription>
    );
};
