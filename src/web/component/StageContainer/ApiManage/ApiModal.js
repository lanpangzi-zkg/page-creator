import React from 'react';
import { Modal, Form, Select, Input, Switch, Tooltip, Icon } from 'antd';

const { Item } = Form;
const { Option } = Select;

const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 14 },
};
const INVALID_API_NAME_QUEUE = ['userCenter', 'log', 'monitorHost'];
class ApiModal extends React.PureComponent {
    afterClose = () => {
        this.props.form.resetFields();
    }
    componentDidUpdate(prevProps) {
        const { visible, editApi, form } = this.props;
        if (editApi && prevProps.visible !== visible && visible) {
            const { uid, isPagination, paginationParamsMap, ...rest } = editApi;
            form.setFieldsValue(Object.assign(rest, { isPagination }));
            if (isPagination) {
                setTimeout(() => {
                    form.setFieldsValue({ paginationParamsMap });
                });
            }
        }
    }
    onSubmit = (e) => {
        e.preventDefault();
        const { form, onClose, editApi } = this.props;
        form.validateFields((err, values) => {
            if (!err) {
                onClose(e, editApi ? Object.assign(editApi, values) : values);
            }
        });
    }
    renderHostOptions() {
        if (window.configs) {
            const { host } = window.configs;
            return Object.keys(host).reduce((hosts, k) => {
                if (typeof host[k] === 'string' && !INVALID_API_NAME_QUEUE.includes(k)) {
                    hosts.push({
                        name: k,
                    });
                }
                return hosts;
            }, []).map(({ name }) => {
                return (
                    <Option
                        key={name}
                        value={name}
                    >
                        {name}
                    </Option>
                );
            });
        }
        return null;
    }
    renderPaginationOptions() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        if (getFieldValue('isPagination')) {
            return (
                <Item label={this.renderReactNodeLabel('分页参数', '【当前页】和【每页条数】两个参数的标识符，逗号隔开')}>
                    {getFieldDecorator('paginationParamsMap', {
                        initialValue: 'pageIndex, pageSize',
                        rules: [{
                            required: true,
                            message: '分页参数必填'
                        }]
                    })(
                        <Input placeholder="当前页,每页条数" />
                    )}
                </Item>
            );
        }
        return null;
    }
    renderReactNodeLabel(label, title) {
        return (
            <span>
                {label}&nbsp;
                <Tooltip title={title}>
                    <Icon type="question-circle-o" />
                </Tooltip>
            </span>
        );
    }
    render() {
        const { onClose, visible, form } = this.props;
        const { getFieldDecorator } = form;
        return (
            <Modal
                title="api"
                visible={visible}
                onCancel={onClose}
                onOk={this.onSubmit}
                maskClosable={false}
                afterClose={this.afterClose}
            >
                <Form {...formItemLayout}>
                    <Item label="host">
                        {getFieldDecorator('host', {
                            rules: [{
                                required: true,
                                message: '请选择'
                            }]
                        })(
                            <Select allowClear>
                                {this.renderHostOptions()}
                            </Select>
                        )}
                    </Item>
                    <Item label="method">
                        {getFieldDecorator('method', {
                            initialValue: 'GET',
                        })(
                            <Select>
                                <Option value="GET">GET</Option>
                                <Option value="POST">POST</Option>
                                <Option value="PUT">PUT</Option>
                                <Option value="DELETE">DELETE</Option>
                            </Select>
                        )}
                    </Item>
                    <Item label="url">
                        {getFieldDecorator('url', {
                             rules: [{
                                required: true,
                                message: '请输入接口地址'
                            }]
                        })(
                            <Input />
                        )}
                    </Item>
                    <Item label="接口别名">
                        {getFieldDecorator('alias', {
                             rules: [{
                                required: true,
                                message: '请输入接口别名'
                            }]
                        })(
                            <Input />
                        )}
                    </Item>
                    <Item label={this.renderReactNodeLabel('请求参数', '配置参数及映射关系，多个参数以逗号分开')}>
                        {getFieldDecorator('paramsMap')(
                            <Input.TextArea
                                rows={6} 
                                placeholder={`a = 123,// 设置默认值\nb,\nc = 'form.getFieldValue("d")', //设置映射关系\ne:number // 设置参数类型`}
                            />
                        )}
                    </Item>
                    <Item label="modelKey">
                        {getFieldDecorator('modelKey')(
                            <Input placeholder="接口数据保存在model的key" />
                        )}
                    </Item>
                    <Item label={this.renderReactNodeLabel('触发请求', '在组件生命周期函数中自动触发')}>
                        {getFieldDecorator('triggerLifeCycle', {
                            initialValue: '',
                        })(
                            <Select allowClear>
                                <Option value="componentDidMount">componentDidMount</Option>
                                {/* <Option value="componentDidUpdate">componentDidUpdate</Option> */}
                            </Select>
                        )}
                    </Item>
                    <Item label="是否分页">
                        {getFieldDecorator('isPagination', {
                            initialValue: false,
                            valuePropName: 'checked',
                        })(
                            <Switch />
                        )}
                    </Item>
                    {
                        this.renderPaginationOptions() 
                    }
                </Form>
            </Modal>
        );
    }
}

export default Form.create()(ApiModal);
