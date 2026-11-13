import { ButtonBase, styled, Typography } from '@mui/material';
import { Truncator } from 'component/common/Truncator/Truncator';
import { schemaFields } from './schemaFields.ts';
import {
    payloadSchemaTemplateGroups,
    type PayloadSchemaTemplate,
} from './payloadSchemaTemplates';

const StyledTemplateList = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    overflowY: 'auto',
}));

const StyledTemplateGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledTemplateGroupHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
}));

const StyledTemplateOption = styled(ButtonBase)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(0.5),
    width: '100%',
    minWidth: 0,
    padding: theme.spacing(1.5, 2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    background: theme.palette.background.paper,
    textAlign: 'left',
    '&:hover': {
        borderColor: theme.palette.primary.main,
    },
    '&[aria-pressed="true"]': {
        borderColor: theme.palette.primary.containerBorder,
        background: theme.palette.primary.container,
    },
    '&:disabled': {
        opacity: 0.5,
        '&:hover': {
            borderColor: theme.palette.divider,
        },
    },
}));

const StyledTemplateFields = styled(Truncator)(({ theme }) => ({
    marginTop: theme.spacing(0.5),
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
}));

interface ITemplateOptionProps {
    template: PayloadSchemaTemplate;
    selected: boolean;
    disabled: boolean;
    onSelect: (key: string) => void;
}

const TemplateOption = ({
    template,
    selected,
    disabled,
    onSelect,
}: ITemplateOptionProps) => {
    const { fieldNames, hasAdditionalProperties } = schemaFields(
        template.schema,
    );
    const fieldsSummary = `${fieldNames.length}${hasAdditionalProperties ? '+' : ''} fields: ${fieldNames.join(', ')}`;

    return (
        <StyledTemplateOption
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onSelect(template.key)}
        >
            <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                {template.label}
            </Typography>
            {template.schema.description ? (
                <Typography variant='body2' color='text.secondary'>
                    {template.schema.description}
                </Typography>
            ) : null}
            <StyledTemplateFields title={fieldsSummary} arrow>
                {fieldsSummary}
            </StyledTemplateFields>
        </StyledTemplateOption>
    );
};

interface IPayloadSchemaTemplateListProps {
    templateKey: string;
    disabled: boolean;
    onSelect: (key: string) => void;
}

export const PayloadSchemaTemplateList = ({
    templateKey,
    disabled,
    onSelect,
}: IPayloadSchemaTemplateListProps) => (
    <StyledTemplateList role='group' aria-label='Choose a template'>
        {payloadSchemaTemplateGroups.map((group) => (
            <StyledTemplateGroup key={group.groupHeader}>
                <StyledTemplateGroupHeader>
                    {group.groupHeader}
                </StyledTemplateGroupHeader>
                {group.templates.map((template) => (
                    <TemplateOption
                        key={template.key}
                        template={template}
                        selected={templateKey === template.key}
                        disabled={disabled}
                        onSelect={onSelect}
                    />
                ))}
            </StyledTemplateGroup>
        ))}
    </StyledTemplateList>
);
