import React from 'react';
import { Button, Popconfirm } from 'antd';
import BaseRender from './BaseRender';
class RenderButton extends BaseRender {
    isChildProps(propKey) {
        return propKey === 'text';
    }
    render() {
        const { rawProps, logicProps, form } = this.props;
        const { text, htmlType } = rawProps;
        const componentProps = this.getComponentProps();
        if (htmlType === 'reset' && form) { // 是包裹在form内部的重置按钮，重新onClick方法
            componentProps.onClick = () => {
                form.resetFields();
            };
        }
        if (logicProps?.confirmText) {
            const { onClick, ...restProps } = componentProps;
            return (
                this.isRenderComponent() && <Popconfirm
                    okText="是"
                    cancelText="否"
                    onConfirm={onClick}
                    title={logicProps.confirmText}
                >
                    <Button {...restProps}>
                        {text}
                    </Button>
                </Popconfirm>
            );
        }
        return (
            this.isRenderComponent() &&
            <Button {...componentProps}>
                {text}
            </Button>
        );
    }
}

export default RenderButton;