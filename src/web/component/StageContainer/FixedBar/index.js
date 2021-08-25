import React from 'react';
import { Icon } from 'antd';
import './index.css';

function FixedBar({ isHidden, onOpenApiManage, onOpenModalManage }) {
    if (isHidden) { // 预览模式下不展示
        return null;
    }
    return (
        <div className="fixed-bar">
            <Icon
                type="api"
                theme="filled"
                title="接口管理"
                onClick={onOpenApiManage}
            />
            <Icon
                type="appstore"
                theme="filled"
                title="弹窗管理"
                onClick={onOpenModalManage}
            />
        </div>
    );
}

export default FixedBar;