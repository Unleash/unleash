import { IconButton, styled } from '@mui/material';
import type { IConstraint } from 'interfaces/strategy';
import { ConstraintItemHeader } from 'component/common/ConstraintsList/ConstraintItemHeader/ConstraintItemHeader';
import { useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

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

interface ConstraintAccordionViewHeaderMetaInfoProps {
    constraint: IConstraint;
    singleValue: boolean;
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
                />
                {expandable ? (
                    <IconButton type='button'>
                        {expanded ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                ) : null}
            </StyledHeaderMetaInfo>
        </StyledHeaderWrapper>
    );
};
