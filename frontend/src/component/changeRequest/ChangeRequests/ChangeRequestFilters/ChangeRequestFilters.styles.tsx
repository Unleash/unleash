import { Box, Chip, styled, type ChipProps } from '@mui/material';

export const makeStyledChip = (ariaControlTarget: string) =>
    styled(({ ...props }: ChipProps) => (
        <Chip variant='outlined' aria-controls={ariaControlTarget} {...props} />
    ))<ChipProps>(({ theme, label }) => ({
        padding: theme.spacing(0.5),
        fontSize: theme.typography.body2.fontSize,
        height: 'auto',
        '&[aria-current="true"]': {
            backgroundColor: theme.palette.secondary.light,
            fontWeight: 'bold',
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
        },
        ':focus-visible': {
            outline: `1px solid ${theme.palette.primary.main}`,
            borderColor: theme.palette.primary.main,
        },

        borderRadius: 0,
        '&:first-of-type': {
            borderTopLeftRadius: theme.shape.borderRadius,
            borderBottomLeftRadius: theme.shape.borderRadius,
        },
        '&:last-of-type': {
            borderTopRightRadius: theme.shape.borderRadius,
            borderBottomRightRadius: theme.shape.borderRadius,
        },

        '&:not(&[aria-current="true"], :last-of-type)': {
            borderRightWidth: 0,
        },
        '[aria-current="true"] + &': {
            borderLeftWidth: 0,
        },

        '& .MuiChip-label': {
            position: 'relative',
            textAlign: 'center',
            '&::before': {
                content: `'${label}'`,
                fontWeight: 'bold',
                visibility: 'hidden',
                height: 0,
                display: 'block',
                overflow: 'hidden',
                userSelect: 'none',
            },
        },
    }));

export const Wrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-start',
    flexFlow: 'row wrap',
    paddingInline: theme.spacing(3),
    minHeight: theme.spacing(7),
    gap: theme.spacing(2),
}));

export const StyledContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
});
