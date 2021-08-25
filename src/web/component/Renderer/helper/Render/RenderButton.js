import React from 'react';
import { Button, Popconfirm } from 'antd';
import BaseRender from './BaseRender';
class RenderButton extends BaseRender {
    isChildProps(propKey) {
        return propKey === 'text';
    }
    render() {
        const { rawProps, logicProps } = this.props;
        const { text } = rawProps;
        const componentProps = this.getComponentProps();
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