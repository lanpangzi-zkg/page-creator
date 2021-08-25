import React from 'react';
import { Divider } from 'antd';

function RenderDivider({ rawProps: { label, ...rest } }) {
    return (
        <Divider {...rest}>
            {label}
        </Divider>
    );
}

export default RenderDivider;