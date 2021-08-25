export default {
    name: 'Col',
    component: 'Col',
    editProps: {
        span: {
            label: 'span',
            type: 'Number',
            value: 8,
        },
        offset: {
            label: 'offset',
            type: 'Number',
        },
        order: {
            label: 'order',
            type: 'Number',
        },
        pull: {
            label: 'pull',
            type: 'Number',
        },
        push: {
            label: 'push',
            type: 'Number',
        },
        xs: {
            label: 'xs',
            type: 'Input',
            placeholder: '<576px 响应式栅格，可为栅格数或一个包含其他属性的对象',
        },
        sm: {
            label: 'sm',
            type: 'Input',
            placeholder: '>=576px 响应式栅格，可为栅格数或一个包含其他属性的对象',
        },
        md: {
            label: 'md',
            type: 'Input',
            placeholder: '>=768px 响应式栅格，可为栅格数或一个包含其他属性的对象',
        },
        lg: {
            label: 'lg',
            type: 'Input',
            placeholder: '>=992px 响应式栅格，可为栅格数或一个包含其他属性的对象',
        },
        xl: {
            label: 'xl',
            type: 'Input',
            placeholder: '>=1200px 响应式栅格，可为栅格数或一个包含其他属性的对象',
        }
    },
};