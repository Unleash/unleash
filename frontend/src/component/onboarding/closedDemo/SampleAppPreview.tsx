import { Box, styled, Typography, useTheme } from '@mui/material';
import type { DemoUser, UserEvaluation } from './demoModel.js';
import type { GridMode } from './UserGrid.tsx';

const StyledWindow = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    background: theme.palette.background.paper,
    boxShadow: theme.boxShadows.card,
    width: '100%',
}));

const StyledChrome = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    padding: theme.spacing(1, 1.5),
    background: theme.palette.neutral.light,
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledDot = styled('span')(({ theme }) => ({
    width: theme.spacing(1.25),
    height: theme.spacing(1.25),
    borderRadius: '50%',
    background: theme.palette.divider,
}));

const StyledUrl = styled(Box)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    padding: theme.spacing(0.25, 1),
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.default,
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
    flexGrow: 1,
}));

const StyledScreen = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.75),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledProductRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const StyledThumb = styled(Box)(({ theme }) => ({
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.neutral.border,
    flexShrink: 0,
}));

const StyledLine = styled(Box)<{ w: number }>(({ theme, w }) => ({
    height: theme.spacing(1),
    width: `${w}%`,
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.divider,
}));

const StyledCheckoutClassic = styled('button')(({ theme }) => ({
    all: 'unset',
    textAlign: 'center',
    cursor: 'default',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightBold,
    background: theme.palette.background.default,
}));

const StyledCheckoutNew = styled('button', {
    shouldForwardProp: (prop) => prop !== 'accent',
})<{ accent: string }>(({ theme, accent }) => ({
    all: 'unset',
    textAlign: 'center',
    cursor: 'default',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.getContrastText(accent),
    fontWeight: theme.typography.fontWeightBold,
    background: accent,
    transition: theme.transitions.create(['background-color']),
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
}));

const StyledCaption = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    textAlign: 'center',
}));

const StyledLabel = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(0.75),
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
}));

interface ISampleAppPreviewProps {
    user?: DemoUser;
    evaluation?: UserEvaluation;
    mode: GridMode;
    variantOrder: string[];
    variantAccent: (index: number) => string;
}

export const SampleAppPreview = ({
    user,
    evaluation,
    mode,
    variantOrder,
    variantAccent,
}: ISampleAppPreviewProps) => {
    const theme = useTheme();
    const enabled = evaluation?.enabled ?? false;
    const variant = evaluation?.variant;
    const accentIndex = variant
        ? Math.max(0, variantOrder.indexOf(variant))
        : 0;
    // In the variants topic the checkout is coloured by the user's variant; in
    // the rollout/targeting topics it's just the primary "new feature" accent.
    const accent =
        mode === 'variants' && variant
            ? variantAccent(accentIndex)
            : theme.palette.primary.main;

    const caption = !user
        ? 'Click any user in the grid to preview what they see.'
        : enabled
          ? mode === 'variants' && variant
              ? `${user.name} sees version ${variant}.`
              : `${user.name} sees the new checkout.`
          : `${user.name} still sees the current checkout.`;

    return (
        <Box>
            <StyledLabel>Example app · your online store</StyledLabel>
            <StyledWindow>
                <StyledChrome>
                    <StyledDot />
                    <StyledDot />
                    <StyledDot />
                    <StyledUrl>shop.example.com/cart</StyledUrl>
                </StyledChrome>
                <StyledScreen>
                    <StyledProductRow>
                        <StyledThumb />
                        <Box sx={{ flexGrow: 1, display: 'grid', gap: 0.75 }}>
                            <StyledLine w={70} />
                            <StyledLine w={40} />
                        </Box>
                    </StyledProductRow>
                    {enabled ? (
                        <StyledCheckoutNew accent={accent}>
                            {mode === 'variants' && variant
                                ? `1-click checkout · ${variant}`
                                : '⚡ 1-click checkout'}
                        </StyledCheckoutNew>
                    ) : (
                        <StyledCheckoutClassic>
                            Proceed to checkout
                        </StyledCheckoutClassic>
                    )}
                    <StyledCaption variant='body2'>{caption}</StyledCaption>
                </StyledScreen>
            </StyledWindow>
        </Box>
    );
};
