export default {
    name: 'Breadcrumb',
    component: 'Breadcrumb',
    editProps: {
        separator: {
            label: 'separator',
            type: 'Input',
        },
        arrayTypeProps: {
            arrayTypeValue: 'children',
            label: {
                label: 'label',
                type: 'Input',
            },
            href: {
                label: 'href',
                type: 'Input',
            },
        },
    },
};