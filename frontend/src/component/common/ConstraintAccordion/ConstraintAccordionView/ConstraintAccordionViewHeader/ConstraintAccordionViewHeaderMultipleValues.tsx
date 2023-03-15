import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { styled } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { IConstraint } from 'interfaces/strategy';

const StyledValuesSpan = styled('span')(({ theme }) => ({
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
    fontSize: theme.fontSizes.smallBody,
    margin: 'auto 0',
    [theme.breakpoints.down('sm')]: {
        margin: theme.spacing(1, 0),
        textAlign: 'center',
    },
}));

interface ConstraintSingleValueProps {
    constraint: IConstraint;
    expanded: boolean;
    maxLength: number;
    allowExpand: (shouldExpand: boolean) => void;
}

const StyledHeaderValuesContainerWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'stretch',
    margin: 'auto 0',
}));

const StyledHeaderValuesContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'stretch',
    margin: 'auto 0',
    flexDirection: 'column',
    marginLeft: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
        marginLeft: 0,
    },
}));

const StyledHeaderValuesExpand = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(0.5),
    color: theme.palette.links,
    [theme.breakpoints.down('sm')]: {
        textAlign: 'center',
    },
}));

export const ConstraintAccordionViewHeaderMultipleValues = ({
    constraint,
    expanded,
    allowExpand,
    maxLength,
}: ConstraintSingleValueProps) => {
    const [expandable, setExpandable] = useState(false);

    const text = useMemo(() => {
        return constraint?.values?.map(value => value).join(', ');
    }, [constraint]);

    useEffect(() => {
        if (text) {
            allowExpand((text?.length ?? 0) > maxLength);
            setExpandable((text?.length ?? 0) > maxLength);
        }
    }, [text, maxLength, allowExpand, setExpandable]);

    return (
        <StyledHeaderValuesContainerWrapper>
            <StyledHeaderValuesContainer>
                <StyledValuesSpan>{text}</StyledValuesSpan>
                <ConditionallyRender
                    condition={expandable}
                    show={
                        <StyledHeaderValuesExpand
                            className={'valuesExpandLabel'}
                        >
                            {!expanded
                                ? `View all (${constraint?.values?.length})`
                                : 'View less'}
                        </StyledHeaderValuesExpand>
                    }
                />
            </StyledHeaderValuesContainer>
        </StyledHeaderValuesContainerWrapper>
    );
};
