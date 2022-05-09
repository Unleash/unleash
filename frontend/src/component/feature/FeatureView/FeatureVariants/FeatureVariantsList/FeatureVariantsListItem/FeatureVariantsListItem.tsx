import { Chip, IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

import styles from '../variants.module.scss';
import { IFeatureVariant } from 'interfaces/featureToggle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { weightTypes } from '../AddFeatureVariant/enums';

interface IFeatureVariantListItem {
    variant: IFeatureVariant;
    editVariant: any;
    setDelDialog: any;
    editable: boolean;
}

const FeatureVariantListItem = ({
    variant,
    editVariant,
    setDelDialog,
    editable,
}: IFeatureVariantListItem) => {
    const { FIX } = weightTypes;

    return (
        <TableRow>
            <TableCell data-testid={'VARIANT_NAME'}>{variant.name}</TableCell>
            <TableCell className={styles.chipContainer}>
                <ConditionallyRender
                    condition={Boolean(variant.payload)}
                    show={<Chip label="Payload" />}
                />
                <ConditionallyRender
                    condition={
                        variant.overrides && variant.overrides.length > 0
                    }
                    show={
                        <Chip
                            style={{
                                backgroundColor: 'rgba(173, 216, 230, 0.2)',
                            }}
                            label="Overrides"
                        />
                    }
                />
            </TableCell>
            <TableCell data-testid={'VARIANT_WEIGHT'}>
                {variant.weight / 10.0} %
            </TableCell>
            <TableCell data-testid={'VARIANT_WEIGHT_TYPE'}>
                {variant.weightType === FIX ? 'Fix' : 'Variable'}
            </TableCell>
            <ConditionallyRender
                condition={editable}
                show={
                    <TableCell className={styles.actions}>
                        <div className={styles.actionsContainer}>
                            <Tooltip title="Edit variant" arrow>
                                <IconButton
                                    data-testid={'VARIANT_EDIT_BUTTON'}
                                    onClick={() => editVariant(variant.name)}
                                    size="large"
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete variant" arrow>
                                <IconButton
                                    data-testid={`VARIANT_DELETE_BUTTON_${variant.name}`}
                                    onClick={e => {
                                        e.stopPropagation();
                                        setDelDialog({
                                            show: true,
                                            name: variant.name,
                                        });
                                    }}
                                    size="large"
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </TableCell>
                }
                elseShow={<TableCell className={styles.actions} />}
            />
        </TableRow>
    );
};

export default FeatureVariantListItem;
