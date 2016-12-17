import React, { PropTypes, Component } from 'react';

import { Textfield, IconButton, Menu, MenuItem, Checkbox } from 'react-mdl';
import { FormButtons } from '../common';


const trim = (value) => {
    if (value && value.trim) {
        return value.trim();
    } else {
        return value;
    }
};

function gerArrayWithEntries (num) {
    return Array.from(Array(num));
}

const Parameter = ({ set, input = {}, index }) => (
    <div  style={{ background: '#f1f1f1', margin: '20px 0', padding: '10px' }}>
        <Textfield
            style={{ width: '50%' }}
            floatingLabel
            label={`Parameter name ${index + 1}`}
            onChange={({ target }) => set({ name: target.value }, true)}
            value={input.name} />
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <span id={`${index}-type-menu`}>
                {input.type || 'string'}
                <IconButton name="arrow_drop_down" onClick={(evt) => evt.preventDefault()} />
            </span>
            <Menu target={`${index}-type-menu`} align="right">
                <MenuItem onClick={() => set({ type: 'string' })}>String</MenuItem>
                <MenuItem onClick={() => set({ type: 'percentage' })}>Percentage</MenuItem>
                <MenuItem onClick={() => set({ type: 'list' })}>List of values</MenuItem>
                <MenuItem onClick={() => set({ type: 'number' })}>Number</MenuItem>
            </Menu>
        </div>
        <Textfield
            floatingLabel
            style={{ width: '100%' }}
            rows={2}
            label={`Parameter name ${index + 1} description`}
            onChange={({ target }) => set({ description: target.value })}
            value={input.description}
        />
        <Checkbox
            label="Required"
            checked={!!input.required}
            onChange={() => set({ required: !input.required })}
            ripple
            defaultChecked
        />
    </div>
);

const EditHeader = () => (
    <div>
        <h4>Edit strategy</h4>
        <p style={{ background: '#ffb7b7', padding: '5px'  }}>
            Be carefull! Changing a strategy definition might also require changes to the
            implementation in the clients.
        </p>
    </div>
);

const CreateHeader = () => (
    <div>
        <h4>Create a new Strategy definition</h4>
    </div>
);


const Parameters = ({ input = [], count = 0, updateInList }) => (
<div>{
    gerArrayWithEntries(count)
    .map((v, i) => <Parameter
        key={i}
        set={(v) => updateInList('parameters', i, v, true)}
        index={i}
        input={input[i]}
    />)
}</div>);

class AddStrategy extends Component {

    static propTypes () {
        return {
            input: PropTypes.object,
            setValue: PropTypes.func,
            updateInList: PropTypes.func,
            incValue: PropTypes.func,
            clear: PropTypes.func,
            onCancel: PropTypes.func,
            onSubmit: PropTypes.func,
            editmode: PropTypes.bool,
            initCallRequired: PropTypes.bool,
            init: PropTypes.func,
        };
    }

    componentWillMount () {
        // TODO unwind this stuff
        if (this.props.initCallRequired === true) {
            this.props.init(this.props.input);
            if (this.props.input.parameters) {
                this.props.setValue('_params', this.props.input.parameters.length);
            }
        }
    }


    render () {
        const {
            input,
            setValue,
            updateInList,
            incValue,
            onCancel,
            editmode = false,
            onSubmit,
        } = this.props;

        return (
             <form onSubmit={onSubmit(input)}>
                {editmode ? <EditHeader /> : <CreateHeader />}
                <section style={{ margin: '16px 20px' }}>
                    <Textfield label="Strategy name"
                        floatingLabel
                        name="name"
                        required
                        disabled={editmode}
                        pattern="^[0-9a-zA-Z\.\-]+$"
                        onChange={({ target }) => setValue('name', trim(target.value))}
                        value={input.name}
                        />
                    <br />
                    <Textfield
                        floatingLabel
                        style={{ width: '100%' }}
                        rows={2}
                        label="Description"
                        name="description"
                        onChange={({ target }) => setValue('description', target.value)}
                        value={input.description}
                        />
                </section>

                <section style={{ margin: '0 20px' }}>
                    <Parameters input={input.parameters} count={input._params} updateInList={updateInList} />
                    <IconButton raised name="add" title="Add parameter" onClick={(e) => {
                        e.preventDefault();
                        incValue('_params');
                    }}/> &nbsp;Add parameter
                </section>

                <br />
                <hr />

                <FormButtons
                    submitText={editmode ? 'Update' : 'Create'}
                    onCancel={onCancel}
                />
            </form>
        );
    }
}

export default AddStrategy;
