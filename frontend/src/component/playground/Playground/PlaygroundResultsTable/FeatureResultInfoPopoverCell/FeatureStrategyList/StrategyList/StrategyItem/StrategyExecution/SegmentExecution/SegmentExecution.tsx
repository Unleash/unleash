import type { FC } from 'react';
import type { PlaygroundSegmentSchema, PlaygroundRequestSchema } from 'openapi';
import { ConstraintExecution } from '../ConstraintExecution/LegacyConstraintExecution';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import { styled, Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { SegmentItem } from 'component/common/SegmentItem/SegmentItem';

type SegmentExecutionProps = {
    segment: PlaygroundSegmentSchema;
    input?: PlaygroundRequestSchema;
};

const SegmentResultTextWrapper = styled('div')(({ theme }) => ({
    color: theme.palette.error.main,
    display: 'inline-flex',
    justifyContent: 'center',
    marginLeft: 'auto',
    gap: theme.spacing(1),
}));

export const SegmentExecution: FC<SegmentExecutionProps> = ({
    segment,
    input,
}) => {
    return (
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
                    condition={!segment.result}
                    show={
                        <SegmentResultTextWrapper>
                            <Typography variant={'subtitle2'} sx={{ pt: 0.25 }}>
                                segment is false
                            </Typography>
                            <span>
                                <CancelOutlined />
                            </span>
                        </SegmentResultTextWrapper>
                    }
                    elseShow={undefined}
                />
            }
            isExpanded
        />
    );
};
