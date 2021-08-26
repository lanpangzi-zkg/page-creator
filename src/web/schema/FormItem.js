import { style } from './logic';

// FormItem内嵌套Button，那么就不编辑label和submitId
const renderExp = "return (this.props.editSchema.children || []).every(({ component }) => { return component !== 'Button'; })";

export default {
    name: 'FormItem',
    component: 'FormItem',
    isContainer: true,
    editProps: {
        // submitId: {
        //     label: 'id',
        //     type: 'Input',
        //     rules: [{
        //         required: true,
        //         message: '请输入',
        //     }],
        //     isRender: renderExp,
        // },
        label: {
            label: 'label',
            type: 'Input',
            value: 'label',
            isRender: renderExp,
        },
        // arrayTypeProps: {
        //     arrayTypeValue: 'rules',
        //     isRender: renderExp,
        //     required: {
        //         label: 'required',
        //         type: 'Boolean',
        //     },
        //     message: {
        //         label: 'message',
        //         type: 'Input',
        //     },
        //     type: {
        //         label: 'type',
        //         type: 'Select',
        //         options: ['string', 'number', 'boolean', 'integer', 'date', 'url', 'email']
        //     },
        //     pattern: {
        //         label: 'pattern',
        //         type: 'Input',
        //     },
        //     whitespace: {
        //         label: 'whitespace',
        //         type: 'Boolean',
        //     },
        // },
        style,
        colspan: {
            label: '跨列数',
            type: 'Select',
            options: "return Array.apply(null, { length: this.props.editSchema?.return?.schemaProps?.col || 3 }).map((_, i) => i + 1);",
            value: 1,
        }
    },
};