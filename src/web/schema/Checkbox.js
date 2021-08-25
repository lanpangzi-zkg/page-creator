import { style } from './logic';

export default {
    name: 'Checkbox',
    component: 'Checkbox',
    schemaProps: {
        options: [{
            uid: Date.now(),
            label: 'A',
            value: 'A',
        }]
    },
    editProps: {
        style,
        arrayTypeProps: {
            arrayTypeValue: 'options',
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
};