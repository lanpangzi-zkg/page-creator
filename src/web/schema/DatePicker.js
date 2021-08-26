import logic, { style } from './logic';

export default {
    name: 'DatePicker',
    component: 'DatePicker',
    canWrapFieldDecorator: true,
    editProps: {
        // type: {
        //     label: 'type',
        //     type: 'Select',
        //     options: ['DatePicker', 'RangePicker'],
        // },
        style,
        // defaultValue: {
        //     label: 'defaultValue',
        //     type: 'Input',
        // },
        // disabledTime: {
        //     label: 'disabledTime',
        //     type: 'TextArea',
        // },
        format: {
            label: 'format',
            type: 'Input',
        },
        showTime: {
            label: 'showTime',
            type: 'Boolean',
        },
        showToday: {
            label: 'showToday',
            type: 'Boolean',
        },
        placeholder: {
            label: 'placeholder',
            type: 'Input',
        },
        separator: {
            label: 'separator',
            isRender: 'this.props.form.getFieldValue("type") === "RangePicker"',
        }
    },
    logicControll: {
        ...logic('onChange'),
    }
}