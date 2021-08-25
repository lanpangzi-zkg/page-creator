import React from 'react';
import { Button, Drawer, Form, Input } from 'antd';
import { loadConfigsScript } from '../helper';

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
    },
};

class ConfigManage extends React.PureComponent {
    componentDidUpdate(prevProps) {
        if (!prevProps.visible && this.props.visible) {
            const { form, pageConfig } = this.props;
            pageConfig && form.setFieldsValue(pageConfig);
        }
    }
    onClose = (...args) => {
        const { form, onClose } = this.props;
        onClose(...args);
        form.resetFields();
    }
    onSubmit = (e) => {
        e.preventDefault();
        const { form } = this.props;
        form.validateFields((err, values) => {
            if (!err) {
                this.onClose(e, values);
                loadConfigsScript(values.host);
            }
        });
    }
    render() {
        const { visible, form } = this.props;
        const { getFieldDecorator } = form;
        return (
            <Drawer
                width={450}
                title="配置管理"
                visible={visible}
                maskClosable={false}
                onClose={this.onClose}
            >
                <Form
                    {...formItemLayout}
                    onSubmit={this.onSubmit}
                >
                    <Form.Item label="应用域名">
                        {
                            getFieldDecorator('host', {
                                rules: [
                                {
                                    type: 'url',
                                    message: 'url不合法',
                                },
                                {
                                    required: true,
                                    message: '请输入应用域名',
                                },
                                ],
                            })(<Input />)
                        }
                    </Form.Item>
                    <Form.Item label="页面名称">
                        {getFieldDecorator('pageName', {
                            rules: [
                                { required: true, message: '请输入页面名称!' },
                                { pattern: /^[a-zA-Z]+$/, message: '名称只能包含字母！' }
                            ],
                        })(
                            <Input placeholder="页面名称只能包含字母" />
                        )}
                    </Form.Item>
                    <Form.Item label="页面容器样式">
                        {getFieldDecorator('style')(
                            <Input.TextArea
                                rows={5}
                                placeholder="多个样式属性请用逗号分隔，例如{fontSize: '14px', background: '#eee'}"
                            />
                        )}
                    </Form.Item>
                    <Form.Item label=" " colon={false}>
                        <Button type="primary" htmlType="submit">确定</Button>
                    </Form.Item>
                </Form>
            </Drawer>
        );
    }
}

export default Form.create()(ConfigManage);