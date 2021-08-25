const transformApiData = 'return { value: uid, label: `${url}(${method})` };';

const style = {
    label: 'style',
    type: 'TextArea',
    placeholder: `多个样式属性请用逗号分隔，例如{fontSize: '14px', background: '#eee'}`,
};

export {
    transformApiData,
    style,
};

export default function logic(eventName = 'onClick', placeholder = 'console.log(event);\nthis.setState({ count: this.state.count++ });') {
    return {
        eventName,
        disabled: {
            label: 'disabled',
            type: 'TextArea',
            placeholder: 'this.state.btnDisabled === true'
        },
        isRender: {
            label: '渲染条件',
            type: 'TextArea',
            placeholder: 'this.state.isRender === true'
        },
        eventType: {
            label: '事件类型',
            type: 'Select',
            options: [
                { value: 'custom', label: '自定义' },
                { value: 'openModal', label: '打开弹窗' },
                { value: 'requestApi', label: '请求接口' }
            ],
            value: 'custom',
            reactive: {
                custom: [{
                    key: eventName,
                    label: eventName,
                    type: 'TextArea',
                    placeholder,
                    isRender: 'this.props.form.getFieldValue("eventType") === "custom"',
                }],
                openModal: [{
                    key: 'openModal',
                    isRender: 'this.props.form.getFieldValue("eventType") === "openModal"',
                    label: 'openModal',
                    type: 'Select',
                    options: 'return this.props.pageModalQueue;',
                    transformData: 'return { value: name, label: name };',
                }],
                requestApi: [{
                    key: 'requestApi',
                    isRender: 'this.props.form.getFieldValue("eventType") === "requestApi"',
                    label: 'requestApi',
                    type: 'Select',
                    transformData: transformApiData,
                    options: 'return this.props.pageApiQueue;',
                }],
            },
        },
    };
}