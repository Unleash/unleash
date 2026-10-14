import { useId, useRef, useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Chip,
    styled,
    Switch,
    type Theme,
    useTheme,
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { MultiSelectPopover } from 'component/common/MultiSelectPopover/MultiSelectPopover.tsx';
import useAllTags from 'hooks/api/getters/useAllTags/useAllTags';
import useTagApi from 'hooks/api/actions/useTagApi/useTagApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import type { ITag } from 'interfaces/tags';
import { formatTag } from 'utils/format-tag';
import { Section } from './CreateFeatureForm.styles.ts';
import { tagFromKey } from './tagFromKey.ts';

const pluralize = (count: number, noun: string) =>
    `${count} ${noun}${count === 1 ? '' : 's'}`;

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    overflow: 'hidden',
    boxShadow: theme.boxShadows.elevated,
}));

const accordionSummarySlotProps = (theme: Theme) => ({
    root: {
        sx: {
            minHeight: theme.spacing(6),
            '&.Mui-expanded': {
                minHeight: theme.spacing(6),
            },
        },
    },
    content: {
        sx: {
            justifyContent: 'space-between',
            alignItems: 'center',
            marginRight: theme.spacing(1.5),
        },
    },
});

const AccordionHeading = styled('h2')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const AccordionHint = styled('span')(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
    '.Mui-expanded &': {
        display: 'none',
    },
}));

const SettingsBody = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    alignItems: 'center',
    columnGap: theme.spacing(3),
    rowGap: theme.spacing(2),
}));

const FieldLabel = styled('label')(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.secondary,
}));

const ChipRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const TagChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.primary.container,
    color: theme.palette.primary.main,
    borderRadius: `${theme.shape.borderRadius}px`,
    fontSize: theme.typography.caption.fontSize,
}));

const TagDeleteIcon = styled(CloseIcon)(({ theme }) => ({
    '&&': {
        color: theme.palette.primary.main,
        '&:hover': {
            color: theme.palette.primary.dark,
        },
    },
}));

const CreateTagButton = styled(Button)(({ theme }) => ({
    justifyContent: 'flex-start',
    padding: theme.spacing(1, 2),
    borderRadius: 0,
    fontWeight: theme.typography.fontWeightBold,
}));

const ImpressionDataRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

type OptionalSettingsFieldsetProps = {
    tags: Set<ITag>;
    onTagsChange: (tags: Set<ITag>) => void;
    impressionData: boolean;
    onImpressionDataChange: (enabled: boolean) => void;
};

export const OptionalSettingsFieldset = ({
    tags,
    onTagsChange,
    impressionData,
    onImpressionDataChange,
}: OptionalSettingsFieldsetProps) => {
    const theme = useTheme();
    const switchId = useId();
    const tagsLabelId = useId();
    const { tags: allTags, refetch: refetchAllTags } = useAllTags();
    const { createTag } = useTagApi();
    const { setToastApiError } = useToast();
    const addTagButtonRef = useRef<HTMLButtonElement>(null);
    const [addTagAnchor, setAddTagAnchor] = useState<HTMLButtonElement | null>(
        null,
    );

    const selectedTags = Array.from(tags);

    const removeTag = (tag: ITag) =>
        onTagsChange(
            new Set(selectedTags.filter((selected) => selected !== tag)),
        );

    const selectTags = (keys: string[]) => {
        const pickedTags = keys.map(tagFromKey);
        onTagsChange(new Set(pickedTags));
    };

    const createAndSelectTag = async (value: string) => {
        const tag = { type: 'simple', value };
        try {
            await createTag(tag);
            refetchAllTags();
            onTagsChange(new Set([...selectedTags, tag]));
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const tagExists = (value: string) =>
        allTags.some(
            (tag) =>
                tag.type === 'simple' &&
                tag.value.toLowerCase() === value.toLowerCase(),
        );

    const summary = [
        selectedTags.length > 0
            ? pluralize(selectedTags.length, 'tag')
            : undefined,
        impressionData ? 'Impression data enabled' : undefined,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <Section>
            <StyledAccordion
                defaultExpanded={selectedTags.length > 0 || impressionData}
            >
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    slotProps={accordionSummarySlotProps(theme)}
                >
                    <AccordionHeading>Other optional settings</AccordionHeading>
                    <AccordionHint>
                        {summary || 'You can change these later'}
                    </AccordionHint>
                </AccordionSummary>
                <AccordionDetails>
                    <SettingsBody>
                        <FieldLabel as='span' id={tagsLabelId}>
                            Tags
                        </FieldLabel>
                        <ChipRow role='group' aria-labelledby={tagsLabelId}>
                            <Button
                                ref={addTagButtonRef}
                                variant='outlined'
                                size='small'
                                startIcon={<AddIcon />}
                                onClick={() =>
                                    setAddTagAnchor(addTagButtonRef.current)
                                }
                            >
                                Add tag
                            </Button>
                            {selectedTags.map((tag) => (
                                <TagChip
                                    key={formatTag(tag)}
                                    size='small'
                                    label={formatTag(tag)}
                                    deleteIcon={<TagDeleteIcon />}
                                    onDelete={() => {
                                        removeTag(tag);
                                        addTagButtonRef.current?.focus();
                                    }}
                                />
                            ))}
                            <MultiSelectPopover
                                open={Boolean(addTagAnchor)}
                                anchorEl={addTagAnchor}
                                onClose={() => setAddTagAnchor(null)}
                                options={allTags.map((tag) => ({
                                    label: formatTag(tag),
                                    value: formatTag(tag),
                                }))}
                                selected={selectedTags.map(formatTag)}
                                onChange={selectTags}
                                searchPlaceholderText='Find or create a tag'
                                renderBelowOptions={(value) =>
                                    value && !tagExists(value) ? (
                                        <CreateTagButton
                                            fullWidth
                                            startIcon={<AddIcon />}
                                            onClick={() =>
                                                createAndSelectTag(value)
                                            }
                                        >
                                            Create simple:{value}
                                        </CreateTagButton>
                                    ) : null
                                }
                            />
                        </ChipRow>
                        <FieldLabel htmlFor={switchId}>
                            Impression data
                        </FieldLabel>
                        <ImpressionDataRow>
                            <Switch
                                id={switchId}
                                checked={impressionData}
                                onChange={(event) =>
                                    onImpressionDataChange(event.target.checked)
                                }
                            />
                            <span>
                                {impressionData
                                    ? 'Impression data enabled'
                                    : 'Impression data not enabled'}
                            </span>
                            <HelpIcon
                                tooltip={
                                    <>
                                        Impression data is used to track how
                                        your flag is performing. When enabled,
                                        you can subscribe to 'impression events'
                                        in the SDK and process them according to
                                        your needs.
                                    </>
                                }
                                htmlTooltip
                            />
                        </ImpressionDataRow>
                    </SettingsBody>
                </AccordionDetails>
            </StyledAccordion>
        </Section>
    );
};
