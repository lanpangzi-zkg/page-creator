import React from 'react';
import { DatePicker } from 'antd';
import BaseRender from './BaseRender';

const { RangePicker } = DatePicker;

class RenderDatePicker extends BaseRender {
    isChildProps(propKey) {
        return propKey === 'type';
    }
    render() {
        const { rawProps } = this.props;
        const componentProps = this.getComponentProps();
        return (
            this.isRenderComponent() && 
            rawProps.type === 'RangePicker' ? <RangePicker {...componentProps} /> : <DatePicker {...componentProps} />
        );
    }
}

export default RenderDatePicker;