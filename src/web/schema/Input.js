import logic, { style } from "./logic";

export default {
    name: 'Input',
    component: 'Input',
    editProps: {
        style,
        maxLength: {
            label: 'maxLength',
            type: 'Number',
            value: Infinity,
        },
        addonAfter: {
            label: 'addonAfter',
            type: 'Input',
        },
        addonBefore: {
            label: 'addonBefore',
            type: 'Input',
        },
        defaultValue: {
            label: 'defaultValue',
            type: 'Input',
        },
        prefix: {
            label: 'prefix',
            type: 'Input',
        },
        suffix: {
            label: 'suffix',
            type: 'Input',
        },
        size: {
            label: 'size',
            type: 'Select',
            options: ['default', 'small', 'large'],
        },
        allowClear: {
            label: 'allowClear',
            type: 'Boolean',
        },
        placeholder: {
            label: 'placeholder',
            type: 'Input',
        }
    },
    logicControll: {
        ...logic('onChange'),
    },
};