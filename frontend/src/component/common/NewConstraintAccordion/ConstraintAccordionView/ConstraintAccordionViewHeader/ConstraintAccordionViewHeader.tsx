import type { IConstraint } from 'interfaces/strategy';
import { ConstraintAccordionViewHeaderInfo } from './ConstraintAccordionViewHeaderInfo.tsx';
import { styled } from '@mui/system';
import { ConstraintAccordionViewActions } from '../../ConstraintAccordionViewActions/ConstraintAccordionViewActions.tsx';

interface IConstraintAccordionViewHeaderProps {
    constraint: IConstraint;
    onUse?: () => void;
    expanded: boolean;
    allowExpand: (shouldExpand: boolean) => void;
    disabled?: boolean;
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
    },
}));

export const ConstraintAccordionViewHeader = ({
    constraint,
    onUse,
    allowExpand,
    expanded,
    disabled,
}: IConstraintAccordionViewHeaderProps) => {
    return (
        <StyledContainer>
            <ConstraintAccordionViewHeaderInfo
                constraint={constraint}
                allowExpand={allowExpand}
                expanded={expanded}
                disabled={disabled}
            />
            {onUse ? <ConstraintAccordionViewActions onUse={onUse} /> : null}
        </StyledContainer>
    );
};
