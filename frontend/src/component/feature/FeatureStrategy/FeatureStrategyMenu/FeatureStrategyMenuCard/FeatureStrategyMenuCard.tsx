import { styled } from '@mui/material';
import { Truncator } from 'component/common/Truncator/Truncator';
import type { ReactNode } from 'react';

const StyledIcon = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    '& > svg': {
        width: theme.spacing(6),
        height: theme.spacing(6),
        fill: theme.palette.primary.main,
    },
}));

const StyledName = styled(Truncator)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledCard = styled('div', {
    shouldForwardProp: (prop) => prop !== 'isDefault',
})<{ isDefault?: boolean }>(({ theme, isDefault }) => ({
    display: 'flex',
    alignItems: 'center',
    height: theme.spacing(10),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.elevation1,
    color: 'inherit',
    textDecoration: 'inherit',
    lineHeight: 1.25,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
    borderRadius: theme.spacing(1),
    textAlign: 'left',
    overflow: 'hidden',
    position: 'relative',
    fontSize: theme.typography.caption.fontSize,
    '&:hover .cardContent, &:focus-within .cardContent': {
        opacity: 0.4,
    },
    '&:hover .cardActions, &:focus-within .cardActions': {
        opacity: 1,
    },
    ...(isDefault && {
        backgroundColor: theme.palette.secondary.light,
        borderColor: theme.palette.secondary.border,
    }),
    userSelect: 'none',
}));

const StyledCardContent = styled('div')(({ theme }) => ({
    display: 'flex',
    transition: 'opacity 0.2s ease-in-out',
    gap: theme.spacing(2),
}));

const StyledCardDescription = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
}));

const StyledCardActions = styled('div')(({ theme }) => ({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    top: theme.spacing(0),
    bottom: theme.spacing(0),
    right: theme.spacing(2),
    gap: theme.spacing(1),
    opacity: 0,
    transition: 'opacity 0.1s ease-in-out',
}));

interface IFeatureStrategyMenuCardProps {
    name: string;
    description: string;
    icon: ReactNode;
    isDefault?: boolean;
    children: ReactNode;
}

export const FeatureStrategyMenuCard = ({
    name,
    description,
    icon,
    isDefault,
    children,
}: IFeatureStrategyMenuCardProps) => (
    <StyledCard isDefault={isDefault}>
        <StyledCardContent className='cardContent'>
            <StyledIcon>{icon}</StyledIcon>
            <StyledCardDescription>
                <StyledName lines={1} title={name} arrow>
                    {name}
                </StyledName>
                {description && (
                    <Truncator lines={2} title={description} arrow>
                        {description}
                    </Truncator>
                )}
            </StyledCardDescription>
        </StyledCardContent>
        <StyledCardActions className='cardActions'>
            {children}
        </StyledCardActions>
    </StyledCard>
);
