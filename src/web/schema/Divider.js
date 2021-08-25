export default {
    name: 'Divider',
    component: 'Divider',
    editProps: {
        className: {
            type: 'Input',
            label: 'className',
        },
        dashed: {
            type: 'Boolean',
            label: 'dashed',
        },
        orientation: {
            type: 'Select',
            label: 'orientation',
            options: ['center', 'left', 'right'],
        },
        style: {
            type: 'TextArea',
            label: 'style',
            placeholder: 'textAlign: \'center\', fontSize: 18'
        },
        type: {
            type: 'Select',
            label: 'type',
            options: ['horizontal', 'vertical'],
        },
        label: {
            type: 'Input',
            label: 'text',
        }
    },
};