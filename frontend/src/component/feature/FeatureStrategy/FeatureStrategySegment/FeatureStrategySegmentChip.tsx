import React from 'react';
import { Link } from 'react-router-dom';
import { ISegment } from 'interfaces/segment';
import { Clear, VisibilityOff, Visibility } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { constraintAccordionListId } from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';
import { styled, Theme, Tooltip } from '@mui/material';

interface IFeatureStrategySegmentListProps {
    segment: ISegment;
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
    preview?: ISegment;
    setPreview: React.Dispatch<React.SetStateAction<ISegment | undefined>>;
}

const StyledChip = styled('span')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    paddingInlineStart: theme.spacing(2),
    paddingInlineEnd: theme.spacing(1),
    paddingBlockStart: theme.spacing(0.5),
    paddingBlockEnd: theme.spacing(0.5),
    borderRadius: '100rem',
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
}));

const StyledButton = styled('button')(({ theme }) => ({
    all: 'unset',
    height: theme.spacing(2),
    cursor: 'pointer',
}));

const StyledLink = styled(Link)(({ theme }) => ({
    marginRight: theme.spacing(1),
    color: 'inherit',
    textDecoration: 'none',
}));

const styledIcon = (theme: Theme) => ({ fontSize: theme.fontSizes.bodySize });

export const FeatureStrategySegmentChip = ({
    segment,
    setSegments,
    preview,
    setPreview,
}: IFeatureStrategySegmentListProps) => {
    const onRemove = () => {
        setSegments(prev => {
            return prev.filter(s => s.id !== segment.id);
        });
        setPreview(prev => {
            return prev === segment ? undefined : prev;
        });
    };

    const onTogglePreview = () => {
        setPreview(prev => {
            return prev === segment ? undefined : segment;
        });
    };

    const togglePreviewIcon = (
        <ConditionallyRender
            condition={segment === preview}
            show={<VisibilityOff titleAccess="Hide" sx={styledIcon} />}
            elseShow={<Visibility titleAccess="Show" sx={styledIcon} />}
        />
    );

    const previewIconTooltip =
        segment === preview
            ? 'Hide segment constraints'
            : 'Preview segment constraints';

    return (
        <StyledChip>
            <StyledLink
                to={`/segments/edit/${segment.id}`}
                target="_blank"
                rel="noreferrer"
            >
                {segment.name}
            </StyledLink>
            <Tooltip title={previewIconTooltip} arrow>
                <StyledButton
                    type="button"
                    onClick={onTogglePreview}
                    aria-expanded={segment === preview}
                    aria-controls={constraintAccordionListId}
                >
                    {togglePreviewIcon}
                </StyledButton>
            </Tooltip>
            <Tooltip title="Remove segment" arrow>
                <StyledButton type="button" onClick={onRemove}>
                    <Clear titleAccess="Remove" sx={styledIcon} />
                </StyledButton>
            </Tooltip>
        </StyledChip>
    );
};
