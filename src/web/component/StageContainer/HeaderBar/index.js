import React from 'react';
import { Icon } from 'antd';
import './index.css';

function HeaderBar({
    onGeneratePage,
    onOpenApiManage,
    onOpenModalManage,
    onOpenConfigManage,
}) {
    return (
        <div className="header-bar">
            <ul>
                <li onClick={onOpenConfigManage}>
                    <Icon type="code" />
                    <div>配置</div>
                </li>
                <li onClick={onOpenApiManage}>
                    <Icon type="api" />
                    <div>API</div>
                </li>
                <li onClick={onOpenModalManage}>
                    <Icon type="switcher" />
                    <div>弹窗</div>
                </li>
                {/* <li
                    id="btn-ger-code"
                    onClick={onGeneratePage}
                >
                    <Icon type="export" />
                    <div>生成代码</div>
                </li> */}
            </ul>
        </div>
    );
}

export default HeaderBar;
