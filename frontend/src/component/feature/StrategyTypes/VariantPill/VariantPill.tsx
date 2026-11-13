import { memo } from 'react';
import { styled, Tab, type TabProps } from '@mui/material';
import { Truncator } from 'component/common/Truncator/Truncator';

const Pill = styled(Tab)(({ theme }) => ({
    minHeight: 0,
    minWidth: 0,
    padding: theme.spacing(0.75, 1.5),
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(0.75, 1.5),
    },
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusExtraLarge,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover': {
        backgroundColor: theme.palette.background.paper,
    },
    '&.Mui-selected': {
        fontWeight: theme.typography.fontWeightRegular,
        borderColor: theme.palette.primary.main,
        boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}`,
    },
    '& > span': {
        color: 'inherit',
    },
    '&[data-error]': {
        borderColor: theme.palette.error.main,
    },
    '&[data-error].Mui-selected': {
        borderColor: theme.palette.error.main,
        boxShadow: `inset 0 0 0 1px ${theme.palette.error.main}`,
    },
}));

const Dot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>(({ theme, color }) => ({
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    borderRadius: '50%',
    background: color,
}));

const Label = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const Weight = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

type VariantPillProps = Omit<TabProps, 'label' | 'icon'> & {
    name: string;
    weight: number;
    color: string;
    hasError?: boolean;
};

export const VariantPill = memo(function VariantPill({
    name,
    weight,
    color,
    hasError,
    ...tabProps
}: VariantPillProps) {
    return (
        <Pill
            {...tabProps}
            data-error={hasError || undefined}
            icon={<Dot aria-hidden color={color} />}
            iconPosition='start'
            label={
                <Label>
                    <Truncator
                        component='span'
                        sx={(theme) => ({
                            maxWidth: theme.spacing(20),
                            lineHeight: 'normal',
                        })}
                    >
                        {name}
                    </Truncator>
                    <Weight>{weight / 10}%</Weight>
                </Label>
            }
        />
    );
});
