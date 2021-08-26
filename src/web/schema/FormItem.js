import { style } from './logic';

// FormItem内嵌套Button或者没有子组件，那么就不编辑label
const renderExp = "const children = (this.props.editSchema.children || []); return children.length > 0 && children.every(({ component }) => { return component !== 'Button'; })";

export default {
    name: 'FormItem',
    component: 'FormItem',
    isContainer: true,
    editProps: {
        label: {
            label: 'label',
            type: 'Input',
            value: 'label',
            isRender: renderExp,
        },
        style,
        colspan: {
            label: '跨列数',
            type: 'Select',
            options: "return Array.apply(null, { length: this.props.editSchema?.return?.schemaProps?.col || 3 }).map((_, i) => i + 1);",
            value: 1,
        }
    },
};