import { Typography, IconButton, styled } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { formatCurrency } from '../types.ts';
import { Badge } from 'component/common/Badge/Badge.tsx';

const HeaderRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const HeaderLeft = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    flex: 1,
    minWidth: 0,
}));

const HeaderRight = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

interface InvoiceHeaderProps {
    dateLabel: string;
    total: number;
    estimated: boolean;
    expanded: boolean;
    onToggle: () => void;
}

export const InvoiceHeader = ({
    dateLabel,
    total,
    estimated,
    expanded,
    onToggle,
}: InvoiceHeaderProps) => (
    <HeaderRow>
        <HeaderLeft>
            <Typography variant='h2' component='h3' sx={{ fontWeight: 700 }}>
                {dateLabel}
            </Typography>
            {estimated ? <Badge color='warning'>Estimated</Badge> : null}
        </HeaderLeft>
        <HeaderRight>
            <Typography variant='body1' sx={{ fontWeight: 700 }}>
                {formatCurrency(total)}
            </Typography>
            <IconButton
                aria-label='Toggle invoice details'
                aria-expanded={expanded}
                onClick={onToggle}
                size='small'
            >
                <ExpandLessIcon
                    sx={{
                        transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)',
                        transition: 'transform 0.2s',
                    }}
                />
            </IconButton>
        </HeaderRight>
    </HeaderRow>
);
