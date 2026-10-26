import { Button, styled } from '@mui/material';

const StyledFooter = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 1, 1, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

type SelectPopoverFooterProps = {
    closeHintId: string;
    onClose: () => void;
};

export const SelectPopoverFooter = ({
    closeHintId,
    onClose,
}: SelectPopoverFooterProps) => (
    <StyledFooter>
        <span id={closeHintId}>Esc to close</span>
        <Button size='small' onClick={onClose}>
            Done
        </Button>
    </StyledFooter>
);
