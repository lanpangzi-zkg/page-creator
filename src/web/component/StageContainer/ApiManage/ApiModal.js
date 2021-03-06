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
                <Item label={this.renderReactNodeLabel('????????????', '???????????????????????????????????????????????????????????????????????????')}>
                    {getFieldDecorator('paginationParamsMap', {
                        initialValue: 'pageIndex, pageSize',
                        rules: [{
                            required: true,
                            message: '??????????????????'
                        }]
                    })(
                        <Input placeholder="?????????,????????????" />
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
                                message: '?????????'
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
                                message: '?????????????????????'
                            }]
                        })(
                            <Input />
                        )}
                    </Item>
                    <Item label="????????????">
                        {getFieldDecorator('alias', {
                             rules: [{
                                required: true,
                                message: '?????????????????????'
                            }]
                        })(
                            <Input />
                        )}
                    </Item>
                    <Item label={this.renderReactNodeLabel('????????????', '?????????????????????????????????????????????????????????')}>
                        {getFieldDecorator('paramsMap')(
                            <Input.TextArea
                                rows={6} 
                                placeholder={`a = 123,// ???????????????\nb,\nc = 'form.getFieldValue("d")', //??????????????????\ne:number // ??????????????????`}
                            />
                        )}
                    </Item>
                    <Item label="modelKey">
                        {getFieldDecorator('modelKey')(
                            <Input placeholder="?????????????????????model???key" />
                        )}
                    </Item>
                    <Item label={this.renderReactNodeLabel('????????????', '??????????????????????????????????????????')}>
                        {getFieldDecorator('triggerLifeCycle', {
                            initialValue: '',
                        })(
                            <Select allowClear>
                                <Option value="componentDidMount">componentDidMount</Option>
                                {/* <Option value="componentDidUpdate">componentDidUpdate</Option> */}
                            </Select>
                        )}
                    </Item>
                    <Item label="????????????">
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
