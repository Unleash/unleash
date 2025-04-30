import { ConstraintIcon } from 'component/common/LegacyConstraintAccordion/ConstraintIcon';
import type { IConstraint } from 'interfaces/strategy';
import { ConstraintAccordionViewHeaderInfo } from './ConstraintAccordionViewHeaderInfo';
import { ConstraintAccordionViewHeaderInfo as LegacyConstraintAccordionViewHeaderInfo } from './LegacyConstraintAccordionViewHeaderInfo';
import { styled } from '@mui/system';
import { useUiFlag } from 'hooks/useUiFlag';
import { ConstraintAccordionViewActions } from '../../ConstraintAccordionViewActions/ConstraintAccordionViewActions';

interface IConstraintAccordionViewHeaderProps {
    constraint: IConstraint;
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
    onUse,
    singleValue,
    allowExpand,
    expanded,
    compact,
    disabled,
}: IConstraintAccordionViewHeaderProps) => {
    const flagOverviewRedesign = useUiFlag('flagOverviewRedesign');

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
            <ConstraintAccordionViewActions onUse={onUse} />
        </StyledContainer>
    );
};
