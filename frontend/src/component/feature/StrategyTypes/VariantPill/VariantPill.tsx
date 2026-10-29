import {
    styled,
    Tab,
    type TabProps,
    Typography,
    useTheme,
} from '@mui/material';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import type { StrategyVariantSchema } from 'openapi';

const Pill = styled(Tab)(({ theme }) => ({
    minHeight: 0,
    minWidth: 0,
    padding: theme.spacing(0.75, 1.5),
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

const TooltipBody = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    minWidth: theme.spacing(30),
    fontSize: theme.typography.body2.fontSize,
}));

const TooltipTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const PayloadRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const Chip = styled('span')(({ theme }) => ({
    background: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(0.25, 1),
}));

const PayloadType = styled(Chip)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

const PayloadValue = styled('code', {
    shouldForwardProp: (prop) => prop !== 'multiline',
})<{ multiline: boolean }>(({ theme, multiline }) => ({
    background: theme.palette.background.elevation2,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(0.25, 1),
    whiteSpace: 'pre-wrap',
    flexBasis: multiline ? '100%' : 'auto',
}));

type VariantSummaryProps = {
    name: string;
    weight: number;
    payload?: StrategyVariantSchema['payload'];
    color: string;
};

const VariantSummary = ({
    name,
    weight,
    payload,
    color,
}: VariantSummaryProps) => (
    <TooltipBody>
        <TooltipTitle>
            <Dot aria-hidden color={color} />
            <Typography variant='subtitle2'>
                {name ? `${weight / 10}% - ${name}` : `${weight / 10}%`}
            </Typography>
        </TooltipTitle>
        <PayloadRow>
            {payload?.value ? (
                <>
                    <PayloadType>{payload.type}</PayloadType>
                    payload:
                    <PayloadValue multiline={payload.value.includes('\n')}>
                        {payload.value}
                    </PayloadValue>
                </>
            ) : (
                <>
                    payload:
                    <Chip>not set</Chip>
                </>
            )}
        </PayloadRow>
    </TooltipBody>
);

type VariantPillProps = Omit<TabProps, 'label' | 'icon'> & {
    name: string;
    weight: number;
    payload?: StrategyVariantSchema['payload'];
    color: string;
};

export const VariantPill = ({
    name,
    weight,
    payload,
    color,
    ...tabProps
}: VariantPillProps) => {
    const theme = useTheme();

    return (
        <HtmlTooltip
            title={
                <VariantSummary
                    name={name}
                    weight={weight}
                    payload={payload}
                    color={color}
                />
            }
            maxHeight={theme.spacing(30)}
            placement='top'
            describeChild
            arrow
        >
            <Pill
                {...tabProps}
                icon={<Dot aria-hidden color={color} />}
                iconPosition='start'
                label={
                    <Label>
                        {name}
                        <Weight>{weight / 10}%</Weight>
                    </Label>
                }
            />
        </HtmlTooltip>
    );
};
