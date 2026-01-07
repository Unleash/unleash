import {
    styled,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    background: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
}));

const HeaderRoot = styled(AccordionSummary)(({ theme }) => ({
    padding: theme.spacing(2, 4),
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

const SkeletonBox = styled('div')(({ theme }) => ({
    height: theme.spacing(2.5),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(0.5, 0),
}));

const SkeletonBadge = styled('div')(({ theme }) => ({
    height: theme.spacing(3),
    width: theme.spacing(10),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.spacing(1.5),
}));

const SkeletonAmount = styled('div')(({ theme }) => ({
    height: theme.spacing(3),
    width: theme.spacing(12.5),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.spacing(0.5),
}));

const SkeletonContent = styled('div')(({ theme }) => ({
    height: theme.spacing(25),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(2, 4),
}));

export const BillingInvoiceSkeleton = () => {
    return (
        <StyledAccordion defaultExpanded data-loading>
            <HeaderRoot expandIcon={<ExpandMoreIcon />}>
                <HeaderLeft>
                    <SkeletonBox
                        sx={{
                            width: (theme) => theme.spacing(15),
                            height: (theme) => theme.spacing(4),
                        }}
                    />
                </HeaderLeft>
                <HeaderRight>
                    <SkeletonBadge />
                    <SkeletonAmount />
                </HeaderRight>
            </HeaderRoot>
            <AccordionDetails>
                <SkeletonContent />
            </AccordionDetails>
        </StyledAccordion>
    );
};
