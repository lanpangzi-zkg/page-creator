import React from 'react';
import { Radio } from 'antd';
import BaseRender from './BaseRender';

class RenderRadioGroup extends BaseRender {
    isChildProps(propKey) {
        return propKey === 'children' || propKey === 'childComponent';
    }
    render() {
        const { rawProps } = this.props;
        const { childComponent, children } = rawProps;
        const componentProps = this.getComponentProps();
        return (
            this.isRenderComponent() &&
                <Radio.Group {...componentProps}>
                    {
                        children.map(({ uid, value, label }) => {
                            return childComponent === 'Radio.Button' ?
                                <Radio.Button key={uid} value={value}>{label}</Radio.Button>
                                :
                                <Radio key={uid} value={value}>{label}</Radio>
                        })
                    }
                </Radio.Group>
        );
    }
}

export default RenderRadioGroup;
