import type { FC, ReactNode } from 'react';
import {
    AccordionSummary,
    type AccordionSummaryProps,
    styled,
} from '@mui/material';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import ExpandMore from '@mui/icons-material/ExpandMore';

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    boxShadow: 'none',
    padding: theme.spacing(0.5, 3, 0.5, 2),
    [theme.breakpoints.down(400)]: {
        padding: theme.spacing(1, 2),
    },
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    width: '100%',
    color: theme.palette.text.primary,
    alignItems: 'center',
    minHeight: theme.spacing(8),
}));

const StyledHeaderTitle = styled('div')(({ theme }) => ({
    marginRight: 'auto',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
}));

const StyledHeaderTitleLabel = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledStringTruncator = styled(StringTruncator)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
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
    expandable,
    ...props
}) => {
    return (
        <StyledAccordionSummary
            {...props}
            expandIcon={
                expandable ? <ExpandMore titleAccess='Toggle' /> : <></>
            }
            sx={{ cursor: expandable ? 'pointer' : 'default !important' }}
        >
            <StyledHeader data-loading>
                <StyledHeaderTitle>
                    <StyledHeaderTitleLabel>Environment</StyledHeaderTitleLabel>
                    <StyledStringTruncator
                        text={environmentId}
                        maxWidth='100'
                        maxLength={15}
                    />
                </StyledHeaderTitle>
                {children}
            </StyledHeader>
        </StyledAccordionSummary>
    );
};
