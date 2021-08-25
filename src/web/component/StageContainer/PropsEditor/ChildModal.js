import React from 'react';
import { Modal, Form } from 'antd';
import { renderEditItemWithoutChildren } from './renderEditItem';

const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 14 },
};

class ChildModal extends React.PureComponent {
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.afterClose = this.afterClose.bind(this);
    }
    componentDidUpdate(prevProps) {
        if (!prevProps.visible && this.props.visible) {
            const { editData } = this.props;
            if (editData) {
                const { uid, ...rest } = editData;
                this.props.form.setFieldsValue(rest);
            }
        }
    }
    onSubmit(e) {
        e.preventDefault();
        const { form, onClose } = this.props;
        form.validateFields((err, values) => {
            if (!err) {
                onClose(e, values);
            }
        });
    }
    renderEditProps() {
        const { configs } = this.props;
        if (configs == null) {
            return null;
        }
        const { arrayTypeValue, arrayTypeLabel, ...rest } = configs;
        return Object.keys(rest).map((propKey) => {
            return renderEditItemWithoutChildren(propKey, rest[propKey], this);
        });
    }
    afterClose() {
        this.props.form.resetFields();
    }
    render() {
        const { visible, onClose } = this.props;
        return (
            <Modal 
                visible={visible}
                onCancel={onClose}
                onOk={this.onSubmit}
                maskClosable={false}
                afterClose={this.afterClose}
            >
                <Form {...formItemLayout}>
                    {this.renderEditProps()}
                </Form>
            </Modal>
        );
    }
}

export default Form.create()(ChildModal);