import React from 'react';
import { Input } from 'antd';
import BaseRender from './BaseRender';
class RenderInput extends BaseRender {
    render() {
        const componentProps = this.getComponentProps();
        return (
            this.isRenderComponent() && <Input {...componentProps} />
        );
    }
}

export default RenderInput;