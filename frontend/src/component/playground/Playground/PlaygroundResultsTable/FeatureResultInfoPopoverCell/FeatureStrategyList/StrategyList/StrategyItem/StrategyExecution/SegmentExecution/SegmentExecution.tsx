import { Fragment, VFC } from 'react';
import {
    PlaygroundSegmentSchema,
    PlaygroundRequestSchema,
} from 'component/playground/Playground/interfaces/playground.model';
import { ConstraintExecution } from '../ConstraintExecution/ConstraintExecution';
import { CancelOutlined } from '@mui/icons-material';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { styled, Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { SegmentItem } from 'component/common/SegmentItem/SegmentItem';

interface ISegmentExecutionProps {
    segments?: PlaygroundSegmentSchema[];
    input?: PlaygroundRequestSchema;
}

const SegmentResultTextWrapper = styled('div')(({ theme }) => ({
    color: theme.palette.error.main,
    display: 'inline-flex',
    justifyContent: 'center',
    marginLeft: 'auto',
    gap: theme.spacing(1),
}));

export const SegmentExecution: VFC<ISegmentExecutionProps> = ({
    segments,
    input,
}) => {
    if (!segments) return null;

    return (
        <>
            {segments.map((segment, index) => (
                <Fragment key={segment.id}>
                    <SegmentItem
                        segment={segment}
                        constraintList={
                            <ConstraintExecution
                                constraints={segment.constraints}
                                input={input}
                            />
                        }
                        headerContent={
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
                        }
                        isExpanded
                    />
                    <ConditionallyRender
                        condition={
                            // Add IF there is a next segment
                            index >= 0 &&
                            segments.length > 1 &&
                            // Don't add if it's the last segment item
                            index !== segments.length - 1
                        }
                        show={<StrategySeparator text="AND" />}
                    />
                </Fragment>
            ))}
        </>
    );
};
