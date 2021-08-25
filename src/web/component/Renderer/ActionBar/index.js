/**
 * @desc 操作栏，编辑和删除
 */
import React from 'react';
import { Popconfirm, Icon } from 'antd';
import './index.css';

function ActionBar({ show = true, onEdit, onDelete, children }) {
    if (!show) {
        return null;
    }
    return (
        <span className="action-bar">
              <Icon
                type="edit"
                title="编辑"
                className="edit-icon"
                onClick={onEdit}
            />
             <Popconfirm
                title="确定删除组件?"
                onConfirm={onDelete}
                okText="是"
                cancelText="否"
            >
                <Icon
                    type="delete"
                    title="删除"
                    className="edit-icon"
                />
            </Popconfirm>
            {children}
        </span>
    );
}
export default ActionBar;
