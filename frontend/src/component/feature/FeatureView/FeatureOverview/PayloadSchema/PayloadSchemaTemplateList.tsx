import { useState } from 'react';
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
}));

const StyledTemplateFields = styled(Truncator)(({ theme }) => ({
    marginTop: theme.spacing(0.5),
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
}));

interface ITemplateOptionProps {
    template: PayloadSchemaTemplate;
    selected: boolean;
    onSelect: (template: PayloadSchemaTemplate) => void;
}

const TemplateOption = ({
    template,
    selected,
    onSelect,
}: ITemplateOptionProps) => {
    const { fieldNames, hasAdditionalProperties } = schemaFields(
        template.schema,
    );
    const fieldsSummary = `${fieldNames.length}${hasAdditionalProperties ? '+' : ''} fields: ${fieldNames.join(', ')}`;

    return (
        <StyledTemplateOption
            aria-pressed={selected}
            onClick={() => onSelect(template)}
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
    onSelect: (template: PayloadSchemaTemplate) => void;
}

export const PayloadSchemaTemplateList = ({
    onSelect,
}: IPayloadSchemaTemplateListProps) => {
    const [selectedKey, setSelectedKey] = useState('');

    const selectTemplate = (template: PayloadSchemaTemplate) => {
        setSelectedKey(template.key);
        onSelect(template);
    };

    return (
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
                            selected={selectedKey === template.key}
                            onSelect={selectTemplate}
                        />
                    ))}
                </StyledTemplateGroup>
            ))}
        </StyledTemplateList>
    );
};
