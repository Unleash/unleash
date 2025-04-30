import { ConstraintIcon } from 'component/common/LegacyConstraintAccordion/ConstraintIcon';
import type { IConstraint } from 'interfaces/strategy';
import { ConstraintAccordionViewHeaderInfo } from './ConstraintAccordionViewHeaderInfo';
import { ConstraintAccordionViewHeaderInfo as LegacyConstraintAccordionViewHeaderInfo } from './LegacyConstraintAccordionViewHeaderInfo';
import { styled } from '@mui/system';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { useUiFlag } from 'hooks/useUiFlag';
import { ConstraintAccordionViewActions } from '../../ConstraintAccordionViewActions/ConstraintAccordionViewActions';
import { ConstraintAccordionEditActions } from '../../ConstraintAccordionEditActions/ConstraintAccordionEditActions';

interface IConstraintAccordionViewHeaderProps {
    constraint: IConstraint;
    onDelete?: () => void;
    onEdit?: () => void;
    onUse?: () => void;
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
    onUse,
    singleValue,
    allowExpand,
    expanded,
    compact,
    disabled,
}: IConstraintAccordionViewHeaderProps) => {
    const { context } = useUnleashContext();
    const flagOverviewRedesign = useUiFlag('flagOverviewRedesign');
    const { contextName } = constraint;

    const disableEdit = !context
        .map((contextDefinition) => contextDefinition.name)
        .includes(contextName);

    return (
        <StyledContainer>
            {!flagOverviewRedesign ? (
                <ConstraintIcon compact={compact} disabled={disabled} />
            ) : null}
            {flagOverviewRedesign ? (
                <ConstraintAccordionViewHeaderInfo
                    constraint={constraint}
                    allowExpand={allowExpand}
                    expanded={expanded}
                    disabled={disabled}
                />
            ) : (
                <LegacyConstraintAccordionViewHeaderInfo
                    constraint={constraint}
                    singleValue={singleValue}
                    allowExpand={allowExpand}
                    expanded={expanded}
                    disabled={disabled}
                />
            )}
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
