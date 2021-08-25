import { style } from './logic';

export default {
    name: 'Tabs',
    component: 'Tabs',
    schemaProps: {
        children: [{
            uid: Date.now(),
            key: '1',
            tab: 'Tab 1',
        }]
    },
    editProps: {
        type: {
            label: 'type',
            type: 'Select',
            options: ['line', 'card', 'editable-card'],
        },
        defaultActiveKey: {
            label: 'defaultActiveKey',
            type: 'Input',
        },
        size: {
            label: 'size',
            type: 'Select',
            options: ['large', 'default', 'small'],
        },
        style,
        arrayTypeProps: {
            arrayTypeValue: 'children',
            arrayTypeLabel: 'TabPane',
            tab: {
                label: 'tab',
                type: 'Input',
            },
            key: {
                label: 'key',
                type: 'Input',
            },
        },
    },
    logicControll: {
        onChange: {
            label: 'onChange',
            type: 'TextArea',
        }
    },
};