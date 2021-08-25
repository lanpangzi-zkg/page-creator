import { style } from './logic';

export default {
    name: 'Icon',
    component: 'Icon',
    editProps: {
        type: {
            label: 'type',
            type: 'Input',
            value: 'user',
        },
        style,
        theme: {
            label: 'theme',
            type: 'Select',
            options: ['filled', 'outlined', 'twoTone'],
        }
    },
}