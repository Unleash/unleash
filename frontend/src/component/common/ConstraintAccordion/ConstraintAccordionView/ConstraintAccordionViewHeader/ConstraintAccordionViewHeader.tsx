import { ConstraintIcon } from 'component/common/ConstraintAccordion/ConstraintIcon';
import type { IConstraint } from 'interfaces/strategy';
import { ConstraintAccordionViewHeaderInfo } from './ConstraintAccordionViewHeaderInfo';
import { ConstraintAccordionHeaderActions } from '../../ConstraintAccordionHeaderActions/ConstraintAccordionHeaderActions';
import { styled } from '@mui/system';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';

interface IConstraintAccordionViewHeaderProps {
    constraint: IConstraint;
    onDelete?: () => void;
    onEdit?: () => void;
    singleValue: boolean;
    expanded: boolean;
    allowExpand: (shouldExpand: boolean) => void;
    compact?: boolean;
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
    onEdit,
    onDelete,
    singleValue,
    allowExpand,
    expanded,
    compact,
    disabled,
}: IConstraintAccordionViewHeaderProps) => {
    const { context } = useUnleashContext();
    const { contextName } = constraint;

    const disableEdit = !context
        .map((contextDefinition) => contextDefinition.name)
        .includes(contextName);

    return (
        <StyledContainer>
            <ConstraintIcon compact={compact} disabled={disabled} />
            <ConstraintAccordionViewHeaderInfo
                constraint={constraint}
                singleValue={singleValue}
                allowExpand={allowExpand}
                expanded={expanded}
                disabled={disabled}
            />
            <ConstraintAccordionHeaderActions
                onEdit={onEdit}
                onDelete={onDelete}
                disableEdit={disableEdit}
            />
        </StyledContainer>
    );
};
