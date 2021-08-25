import logic, { style } from './logic';

export default {
    name: 'Button',
    component: 'Button',
    editProps: {
        style,
        text: {
            label: 'text',
            type: 'Input',
            value: 'button',
        },
        type: {
            label: 'type',
            type: 'Select',
            options: ['primary', 'dashed', 'danger', 'link'],
            value: '',
        },
        htmlType: {
            label: 'htmlType',
            type: 'Select',
            options: ['submit', 'reset', 'button'],
        },
        size: {
            label: 'size',
            type: 'Select',
            options: ['default', 'small', 'large'],
        },
        ghost: {
            label: 'ghost',
            type: 'Boolean',
        },
        icon: {
            label: 'icon',
            type: 'Input',
        },
        block: {
            label: 'block',
            type: 'Boolean',
        },
        href: {
            label: 'href',
            type: 'Input',
            value: '',
        },
        target: {
            label: 'target',
            type: 'Input',
            value: '',
        },
        shape: {
            label: 'shape',
            type: 'Select',
            options: ['circle-outline', 'circle', 'round'],
            value: '',
        },
    },
    logicControll: {
        ...logic(),
        confirmText: {
            label: 'confirmText',
            type: 'Input',
            placeholder: '确认提示文字',
        }
    },
};