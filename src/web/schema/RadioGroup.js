import logic from './logic';

export default {
    name: 'RadioGroup',
    importName: 'Radio',
    component: 'RadioGroup',
    canWrapFieldDecorator: true,
    editProps: {
        defaultValue: {
            label: 'defaultValue',
            type: 'Input',
        },
        name: {
            label: 'name',
            type: 'Input',
        },
        size: {
            label: 'size',
            type: 'Select',
            options: ['default', 'large', 'small'],
        },
        buttonStyle: {
            label: 'buttonStyle',
            type: 'Select',
            options: ['outline', 'solid'],
        },
        childComponent: {
                label: 'radio类型',
                type: 'Select',
                options: ['Radio', 'Radio.Button'],
                value: 'Radio',
        },
        arrayTypeProps: {
            arrayTypeValue: 'children',
            value: {
                label: 'value',
                type: 'Input',
            },
            label: {
                label: 'label',
                type: 'Input',
            },
        },
    },
    schemaProps: {
        children: [{
            uid: 1,
            value: 'A',
            label: 'A',
            
        }, {
            uid: 2,
            value: 'B',
            label: 'B',
        }],
    },
    logicControll: {
        ...logic('onChange', 'this.setState({ type: event.target.value });'),
    },
};
