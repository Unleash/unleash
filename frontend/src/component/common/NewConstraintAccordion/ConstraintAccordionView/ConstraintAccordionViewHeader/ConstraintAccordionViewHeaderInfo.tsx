import { styled } from '@mui/material';
import type { IConstraint } from 'interfaces/strategy';
import { ConstraintItemHeader } from 'component/common/ConstraintsList/ConstraintItemHeader/ConstraintItemHeader';
import { useState } from 'react';

const StyledHeaderWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    borderRadius: theme.spacing(1),
}));

const StyledHeaderMetaInfo = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'stretch',
    marginLeft: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
        marginLeft: 0,
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
}));

const StyledExpandItem = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    margin: theme.spacing(0.25, 0, 0, 0.75),
    fontSize: theme.fontSizes.smallerBody,
}));

interface ConstraintAccordionViewHeaderMetaInfoProps {
    constraint: IConstraint;
    expanded: boolean;
    allowExpand: (shouldExpand: boolean) => void;
    disabled?: boolean;
    maxLength?: number;
}

export const ConstraintAccordionViewHeaderInfo = ({
    constraint,
    allowExpand,
    expanded,
}: ConstraintAccordionViewHeaderMetaInfoProps) => {
    const [expandable, setExpandable] = useState(false);

    return (
        <StyledHeaderWrapper>
            <StyledHeaderMetaInfo>
                <ConstraintItemHeader
                    {...constraint}
                    onSetTruncated={(state: boolean) => {
                        setExpandable(state);
                        allowExpand(state);
                    }}
                    viewMore={
                        expandable ? (
                            <StyledExpandItem>
                                {expanded
                                    ? 'View less'
                                    : `View all (${constraint.values?.length})`}
                            </StyledExpandItem>
                        ) : null
                    }
                />
            </StyledHeaderMetaInfo>
        </StyledHeaderWrapper>
    );
};
