import type { FC, ReactNode } from 'react';
import {
    AccordionSummary,
    type AccordionSummaryProps,
    styled,
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Truncator } from 'component/common/Truncator/Truncator';

const StyledAccordionSummary = styled(AccordionSummary, {
    shouldForwardProp: (prop) => prop !== 'expandable',
})<{
    expandable?: boolean;
}>(({ theme, expandable }) => ({
    boxShadow: 'none',
    padding: theme.spacing(0.5, 3, 0.5, 2),
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
        fontWeight: 'bold',
    },
    '&&&': {
        cursor: expandable ? 'pointer' : 'default',
    },
}));

const StyledHeader = styled('header')(({ theme }) => ({
    display: 'flex',
    columnGap: theme.spacing(1),
    paddingRight: theme.spacing(1),
    width: '100%',
    color: theme.palette.text.primary,
    alignItems: 'center',
    minHeight: theme.spacing(8),
}));

const StyledHeaderTitle = styled('hgroup')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
}));

const StyledHeaderTitleLabel = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    margin: 0,
}));

const StyledTruncator = styled(Truncator)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
}));

type EnvironmentHeaderProps = {
    environmentId: string;
    children: ReactNode;
    expandable?: boolean;
} & AccordionSummaryProps;

export const EnvironmentHeader: FC<EnvironmentHeaderProps> = ({
    environmentId,
    children,
    expandable = true,
    ...props
}) => {
    return (
        <StyledAccordionSummary
            {...props}
            expandIcon={
                <ExpandMore
                    sx={{ visibility: expandable ? 'visible' : 'hidden' }}
                />
            }
            expandable={expandable}
        >
            <StyledHeader data-loading>
                <StyledHeaderTitle>
                    <StyledHeaderTitleLabel>Environment</StyledHeaderTitleLabel>
                    <StyledTruncator component='h2'>
                        {environmentId}
                    </StyledTruncator>
                </StyledHeaderTitle>
                {children}
            </StyledHeader>
        </StyledAccordionSummary>
    );
};
