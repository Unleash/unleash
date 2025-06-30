import type {
    IChangeRequestDeleteSegment,
    IChangeRequestUpdateSegment,
} from 'component/changeRequest/changeRequest.types';
import type React from 'react';
import { Fragment, type FC } from 'react';
import omit from 'lodash.omit';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { styled } from '@mui/material';
import { textTruncated } from 'themes/themeStyles';
import type { ISegment } from 'interfaces/segment';
import { NameWithChangeInfo } from './NameWithChangeInfo/NameWithChangeInfo.tsx';
import { EventDiff } from 'component/events/EventDiff/EventDiff.tsx';
import { useUiFlag } from 'hooks/useUiFlag.ts';

const StyledCodeSection = styled('div')(({ theme }) => ({
    overflowX: 'auto',
    '& code': {
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        lineHeight: 1.5,
        fontSize: theme.fontSizes.smallBody,
    },
}));

const omitIfDefined = (obj: any, keys: string[]) =>
    obj ? omit(obj, keys) : obj;

export const SegmentDiff: FC<{
    change: IChangeRequestUpdateSegment | IChangeRequestDeleteSegment;
    currentSegment?: ISegment;
}> = ({ change, currentSegment }) => {
    const useNewDiff = useUiFlag('improvedJsonDiff');
    const Wrapper = useNewDiff ? Fragment : StyledCodeSection;

    const changeRequestSegment =
        change.action === 'deleteSegment' ? undefined : change.payload;

    return (
        <Wrapper>
            <EventDiff
                entry={{
                    preData: omitIfDefined(currentSegment, [
                        'createdAt',
                        'createdBy',
                    ]),
                    data: omitIfDefined(changeRequestSegment, ['snapshot']),
                }}
            />
        </Wrapper>
    );
};
interface IStrategyTooltipLinkProps {
    children?: React.ReactNode;
    name?: string;
    previousName?: string;
}

const StyledContainer: FC<{ children?: React.ReactNode }> = styled('div')(
    ({ theme }) => ({
        display: 'grid',
        gridAutoFlow: 'column',
        gridTemplateColumns: 'auto 1fr',
        gap: theme.spacing(1),
        alignItems: 'center',
    }),
);

const ViewDiff = styled('span')(({ theme }) => ({
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
}));

const Truncated = styled('div')(() => ({
    ...textTruncated,
    maxWidth: 500,
    display: 'flex',
}));

export const SegmentTooltipLink: FC<IStrategyTooltipLinkProps> = ({
    name,
    previousName,
    children,
}) => (
    <StyledContainer>
        <Truncated>
            <NameWithChangeInfo previousName={previousName} newName={name} />
            <TooltipLink
                tooltip={children}
                tooltipProps={{
                    maxWidth: 500,
                    maxHeight: 600,
                }}
            >
                <ViewDiff>View Diff</ViewDiff>
            </TooltipLink>
        </Truncated>
    </StyledContainer>
);
