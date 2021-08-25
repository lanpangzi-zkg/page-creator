import React from 'react';
import { Checkbox } from 'antd';
import BaseRender from './BaseRender';

class RenderCheckbox extends BaseRender {
    render() {
        const componentProps = this.getComponentProps();
        return (
            this.isRenderComponent() &&
                <Checkbox.Group {...componentProps} />
        );
    }
}

export default RenderCheckbox;
