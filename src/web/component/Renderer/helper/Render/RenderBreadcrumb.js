import React from 'react';
import { Breadcrumb } from 'antd';

function RenderBreadcrumb({ rawProps }) {
    const { children = [], ...rest } = rawProps;
    return (
        <Breadcrumb {...rest}>
            {children.map(({ uid, label, href }) => {
                return (
                    <Breadcrumb.Item
                        key={uid}
                        href={href}
                    >
                        {label}
                    </Breadcrumb.Item>
                );
            })}
        </Breadcrumb>
    );
}

export default RenderBreadcrumb;