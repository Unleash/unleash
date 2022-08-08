import { VFC } from 'react';
import {
    PlaygroundSegmentSchema,
    PlaygroundRequestSchema,
} from 'hooks/api/actions/usePlayground/playground.model';
import { ConstraintExecution } from '../ConstraintExecution/ConstraintExecution';
import { CancelOutlined, DonutLarge } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { useStyles } from './SegmentExecution.styles';
import { styled, Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface ISegmentExecutionProps {
    segments?: PlaygroundSegmentSchema[];
    input?: PlaygroundRequestSchema;
    hasConstraints: boolean;
}

const SegmentExecutionLinkWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontSize: theme.fontSizes.smallBody,
    position: 'relative',
}));

const SegmentExecutionHeader = styled('div')(({ theme }) => ({
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& + &': {
        margin: theme.spacing(2),
    },
}));

const SegmentExecutionWrapper = styled('div')(({ theme }) => ({
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.dividerAlternative}`,
    '& + &': {
        marginTop: theme.spacing(2),
    },
    background: theme.palette.neutral.light,
    marginBottom: theme.spacing(1),
}));

const SegmentExecutionConstraintWrapper = styled('div')(() => ({
    padding: '12px',
}));

const SegmentResultTextWrapper = styled('div')(({ theme }) => ({
    color: theme.palette.error.main,
    display: 'inline-flex',
    justifyContent: 'center',
    marginRight: '12px',
    gap: theme.spacing(1),
}));

export const SegmentExecution: VFC<ISegmentExecutionProps> = ({
    segments,
    input,
    hasConstraints,
}) => {
    const { classes: styles } = useStyles();

    if (!segments) return null;
    return (
        <>
            {segments.map((segment, index) => (
                <SegmentExecutionWrapper key={segment.id}>
                    <SegmentExecutionHeader>
                        <SegmentExecutionLinkWrapper>
                            <DonutLarge color="secondary" sx={{ mr: 1 }} />{' '}
                            Segment:{' '}
                            <Link
                                to={`/segments/edit/${segment.id}`}
                                className={styles.link}
                            >
                                {segment.name}
                            </Link>
                        </SegmentExecutionLinkWrapper>
                        <ConditionallyRender
                            condition={!Boolean(segment.result)}
                            show={
                                <SegmentResultTextWrapper>
                                    <Typography
                                        variant={'subtitle2'}
                                        sx={{ pt: 0.25 }}
                                    >
                                        segment is false
                                    </Typography>
                                    <span>
                                        <CancelOutlined />
                                    </span>
                                </SegmentResultTextWrapper>
                            }
                        />
                    </SegmentExecutionHeader>
                    <SegmentExecutionConstraintWrapper>
                        <ConstraintExecution
                            constraints={segment.constraints}
                            input={input}
                            compact
                        />
                    </SegmentExecutionConstraintWrapper>
                    <ConditionallyRender
                        condition={
                            index === segments?.length - 1 && hasConstraints
                        }
                        show={<StrategySeparator text="AND" />}
                    />
                </SegmentExecutionWrapper>
            ))}
        </>
    );
};
