import type { IConstraint } from 'interfaces/strategy';
import { ConstraintAccordionViewHeaderInfo } from './ConstraintAccordionViewHeaderInfo.tsx';
import { styled } from '@mui/system';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { ConstraintAccordionViewActions } from '../../ConstraintAccordionViewActions/ConstraintAccordionViewActions.tsx';
import { ConstraintAccordionEditActions } from '../../ConstraintAccordionEditActions/ConstraintAccordionEditActions.tsx';

interface IConstraintAccordionViewHeaderProps {
    constraint: IConstraint;
    onDelete?: () => void;
    onEdit?: () => void;
    onUse?: () => void;
    /**
     * @deprecated
     */
    singleValue: boolean;
    expanded: boolean;
    allowExpand: (shouldExpand: boolean) => void;
    /**
     * @deprecated
     */
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
    onUse,
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
            <ConstraintAccordionViewHeaderInfo
                constraint={constraint}
                allowExpand={allowExpand}
                expanded={expanded}
                disabled={disabled}
            />
            {onUse ? (
                <ConstraintAccordionViewActions onUse={onUse} />
            ) : (
                // @deprecated : remove onEdit and onDelete from current file together with NewConstraintAccordionList and addEditStrategy flag
                <ConstraintAccordionEditActions
                    onEdit={onEdit}
                    onDelete={onDelete}
                    disableEdit={disableEdit}
                />
            )}
        </StyledContainer>
    );
};
