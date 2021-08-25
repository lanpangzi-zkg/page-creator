import React from 'react';
import { Modal, Form, Input, Switch, Select } from 'antd';

const { Item } = Form;
const { Option } = Select;

const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
};

class MModal extends React.PureComponent {
    afterClose = () => {
        this.props.form.resetFields();
    }
    componentDidUpdate(prevProps) {
        const { visible, editModal, form } = this.props;
        if (editModal && !prevProps.visible && visible) {
            const { uid, addRequestApi, editRequestApi, onOkCallBackRequestApi, ...rest } = editModal;
            form.setFieldsValue({
                supportMode: rest.supportMode,
                centered: rest.centered,
                maskClosable: rest.maskClosable,
                name: rest.name,
                title: rest.title,
                width: rest.width,
                wrapClassName: rest.wrapClassName,
            });
            setTimeout(() => {
                const values = (editModal.supportMode || []).reduce((obj, mode) => {
                    const k = [`${mode}RequestApi`];
                    obj[k] = editModal[k];
                    return obj;
                }, { onOkCallBackRequestApi });
                form.setFieldsValue(values);
            });
        }
    }
    onSubmit = (e) => {
        e.preventDefault();
        const { form, onClose, editModal } = this.props;
        form.validateFields((err, values) => {
            if (!err) {
                onClose(e, editModal ? Object.assign(editModal, values) : values);
            }
        });
    }
    getSupportMode() {
        const { getFieldValue } = this.props.form;
        return getFieldValue('supportMode') || [];
    }
    renderOnOkCallBack() {
        const supportMode =this.getSupportMode();
        if (supportMode.length > 0) {
            const { form } = this.props;
            const { getFieldDecorator } = form;
            return (
                <Item label="onOk回调接口">
                    {getFieldDecorator('onOkCallBackRequestApi')(this.renderSelectApi())}
                </Item>
            );
        }
        return null;
    }
    renderSelectApi() {
        const { pageApiQueue } = this.props;
        return (
            <Select>
                {pageApiQueue.map(({ uid, method, url }) => {
                    return (
                        <Option value={uid} key={uid}>{`${url}(${method})`}</Option>
                    );
                })}
            </Select>
        );
    }
    renderApiByMode(mode = 'add', required = true, label = '新增保存', prefixId = mode) {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const supportMode =this.getSupportMode();
        const isIncludeMode = (Array.isArray(mode) ? mode : [mode]).some((item) => {
            return supportMode.includes(item);
        })
        if (isIncludeMode) {
            return (
                <Item label={`${label}接口`}>
                    {getFieldDecorator(`${prefixId}RequestApi`, {
                        rules: [{
                            required,
                            message: '请选择'
                        }]
                    })(this.renderSelectApi())}
                </Item>
            );
        }
        return null;
    }
    render() {
        const { onClose, visible, form } = this.props;
        const { getFieldDecorator } = form;
        return (
            <Modal
                title="modal"
                visible={visible}
                onCancel={onClose}
                onOk={this.onSubmit}
                maskClosable={false}
                afterClose={this.afterClose}
            >
                <Form {...formItemLayout}>
                    <Item label="name">
                        {getFieldDecorator('name', {
                            rules: [{
                                required: true,
                                message: '请输入'
                            }]
                        })(
                            <Input />
                        )}
                    </Item>
                    <Item label="title">
                        {getFieldDecorator('title', {
                            rules: [{
                                required: true,
                                message: '请输入'
                            }]
                        })(
                            <Input />
                        )}
                    </Item>
                    <Item label="width">
                        {getFieldDecorator('width')(
                            <Input />
                        )}
                    </Item>
                    <Item label="支持模式">
                        {getFieldDecorator('supportMode', {
                            rules: [{
                                required: true,
                                message: '请选择'
                            }]
                        })(
                            <Select mode="multiple">
                                <Option value="add">新增</Option>
                                <Option value="edit">编辑</Option>
                                {/* <Option value="view">查看</Option> */}
                            </Select>
                        )}
                    </Item>
                    {this.renderApiByMode()}
                    {this.renderApiByMode('edit', true, '编辑保存')}
                    {this.renderApiByMode(['view', 'edit'], false, '初始化', 'init')}
                    {this.renderOnOkCallBack()}
                    <Item label="wrapClassName">
                        {getFieldDecorator('wrapClassName')(
                            <Input />
                        )}
                    </Item>
                    <Item label="maskClosable">
                        {getFieldDecorator('maskClosable', {
                            initialValue: true,
                            valuePropName: 'checked',
                        })(
                            <Switch />
                        )}
                    </Item>
                    <Item label="centered">
                        {getFieldDecorator('centered', {
                            initialValue: false,
                            valuePropName: 'checked',
                        })(
                            <Switch />
                        )}
                    </Item>
                </Form>
            </Modal>
        );
    }
}

export default Form.create()(MModal);
