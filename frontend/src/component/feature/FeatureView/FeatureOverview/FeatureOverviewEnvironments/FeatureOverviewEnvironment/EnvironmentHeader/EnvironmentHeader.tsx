import type { FC, PropsWithChildren } from 'react';
import {
    AccordionSummary,
    type AccordionSummaryProps,
    styled,
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Truncator } from 'component/common/Truncator/Truncator';
import { useId } from 'hooks/useId';

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
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    flexDirection: 'column',
    flex: 1,
    columnGap: theme.spacing(1),
}));

const StyledHeaderTitleLabel = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    gridColumn: '1/-1',
}));

const StyledTruncator = styled(Truncator)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
}));

const StyledStrategyCount = styled('p', {
    shouldForwardProp: (prop) => prop !== 'count',
})<{ count: number }>(({ theme, count }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color:
        count > 0
            ? theme.palette.info.contrastText
            : theme.palette.text.secondary,
    backgroundColor:
        count > 0 ? theme.palette.info.light : theme.palette.neutral.light,
    whiteSpace: 'nowrap',
    width: 'min-content',
    borderRadius: theme.shape.borderRadiusExtraLarge,
    padding: theme.spacing(0.5, 1),
}));

type EnvironmentHeaderProps = {
    environmentId: string;
    expandable?: boolean;
    strategyCount?: number;
} & AccordionSummaryProps;

export const EnvironmentHeader: FC<
    PropsWithChildren<EnvironmentHeaderProps>
> = ({
    environmentId,
    children,
    expandable = true,
    strategyCount,
    ...props
}) => {
    const id = useId();
    return (
        <StyledAccordionSummary
            {...props}
            expandIcon={
                <ExpandMore
                    sx={{ visibility: expandable ? 'visible' : 'hidden' }}
                />
            }
            id={id}
            aria-controls={`environment-accordion-${id}-content`}
            expandable={expandable}
        >
            <StyledHeader data-loading>
                <StyledHeaderTitle>
                    <StyledHeaderTitleLabel>Environment</StyledHeaderTitleLabel>
                    <StyledTruncator component='h2'>
                        {environmentId}
                    </StyledTruncator>
                    {typeof strategyCount === 'number' ? (
                        <StyledStrategyCount count={strategyCount}>
                            {strategyCount} strategies added
                        </StyledStrategyCount>
                    ) : null}
                </StyledHeaderTitle>
                {children}
            </StyledHeader>
        </StyledAccordionSummary>
    );
};
