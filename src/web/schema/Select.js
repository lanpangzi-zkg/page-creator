import { transformApiData, style } from './logic';

export default {
    name: 'Select',
    component: 'Select',
    editProps: {
        mode: {
            label: 'mode',
            type: 'Select',
            options: ['multiple', 'tags'],
        },
        allowClear: {
            label: 'allowClear',
            type: 'Boolean',
        },
        style,
        arrayTypeProps: {
            arrayTypeValue: 'children',
            arrayTypeLabel: 'Option',
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
    logicControll: {
		requestApi: {
            label: '查询接口',
            type: 'Select',
            options: 'return this.props.pageApiQueue;',
            transformData: transformApiData,
        },
        apiDataTransform: {
            label: '接口数据转换',
            type: 'TextArea',
            placeholder: '接口数据渲染映射关系，例如`return { value: data.id, label: data.name };`',
        }
    },
};