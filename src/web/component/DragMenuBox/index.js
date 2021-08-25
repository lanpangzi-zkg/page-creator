import { Divider } from 'antd';
import React, { Component } from 'react';
import DragMenuFactory from './DragMenuFactory';
import { GROUP_CONTAINER, GROUP_ATOM_COMPONENT } from '../../utils/Constants';

import './index.css';

const TAB_RENDER_CONFIGS = [{
    tabKey: GROUP_CONTAINER,
    icon: 'layout',
    label: '容器',
}, {
    tabKey: GROUP_ATOM_COMPONENT,
    icon: 'appstore',
    label: '组件',
}, /*{
    tabKey: GROUP_TEMPLATE_PAGE,
    icon: 'database',
    label: '模板页',
}*/];
class DragMenuBox extends Component {
	componentDidMount() {
        /* 放置目标元素时触发事件 */
         document.addEventListener("dragover", function( event ) {
             // 阻止默认动作以启用drop
             event.preventDefault();
         }, false);

        /* 拖动目标元素时触发drag事件 */
         document.addEventListener("drag", function( event ) {

        }, false);

        document.addEventListener("dragstart", function( event ) {
          // 使其半透明
              event.target.style.opacity = .5;
        }, false);

        document.addEventListener("dragend", function( event ) {
            // 重置透明度
            event.target.style.opacity = "";
            document.querySelectorAll('.drop-zone').forEach((t) => {
              	t.style.background = "#fff";
            })
        }, false);

        document.addEventListener("dragenter", function( event ) {
          // 当可拖动的元素进入可放置的目标时高亮目标节点
          if ( event.target.className === "drop-zone" ) {
              event.target.style.background = "#96cdf9";
          }
        }, false);

        document.addEventListener("dragleave", function( event ) {
          // 当拖动元素离开可放置目标节点，重置其背景
          if ( event.target.className === "drop-zone" ) {
              event.target.style.background = "";
          }
        }, false);
    }
	render() {
		return (
			<div className="drag-menu-box">
                {
                    TAB_RENDER_CONFIGS.map(({ tabKey, icon, label }) => {
                        return (
                            <React.Fragment key={tabKey}>
                                <Divider key={tabKey}>
                                    <span>
                                        {label}
                                    </span>
                                </Divider>
                                <DragMenuFactory groupType={tabKey} />
                            </React.Fragment>
                        );
                    })
                }
		  	</div>
		);
	}
}

export default DragMenuBox;
