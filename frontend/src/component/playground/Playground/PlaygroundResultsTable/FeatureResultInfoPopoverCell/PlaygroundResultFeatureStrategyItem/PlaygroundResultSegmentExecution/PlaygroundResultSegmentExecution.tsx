import {
    PlaygroundFeatureStrategySegmentResult,
    PlaygroundRequestSchema,
} from '../../../../../../../hooks/api/actions/usePlayground/playground.model';
import { PlaygroundResultConstraintExecution } from '../PlaygroundResultConstraintExecution/PlaygroundResultConstraintExecution';
import { CancelOutlined, DonutLarge } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { StrategySeparator } from '../../../../../../common/StrategySeparator/StrategySeparator';
import { useStyles } from './PlaygroundResultSegmentExecution.styles';
import { styled, Typography } from '@mui/material';
import { ConditionallyRender } from '../../../../../../common/ConditionallyRender/ConditionallyRender';

interface PlaygroundResultSegmentExecutionProps {
    segments?: PlaygroundFeatureStrategySegmentResult[];
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
    marginBottom: '8px',
}));

const SegmentExecutionConstraintWrapper = styled('div')(({ theme }) => ({
    padding: '12px',
}));

const SegmentResultTextWrapper = styled('div')(({ theme }) => ({
    color: theme.palette.error.main,
    display: 'inline-flex',
    justifyContent: 'center',
    marginRight: '12px',
    gap: '8px',
}));

export const PlaygroundResultSegmentExecution = ({
    segments,
    input,
    hasConstraints,
}: PlaygroundResultSegmentExecutionProps) => {
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
                        <PlaygroundResultConstraintExecution
                            constraints={segment.constraints}
                            compact={true}
                            input={input}
                        />
                    </SegmentExecutionConstraintWrapper>
                    <ConditionallyRender
                        condition={
                            index === segments?.length - 1 && hasConstraints
                        }
                        show={<StrategySeparator text="AND" sx={{ pt: 1 }} />}
                    />
                </SegmentExecutionWrapper>
            ))}
        </>
    );
};
