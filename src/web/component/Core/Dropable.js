import React from 'react';
import { DELETE } from '../../shared/Tag';
import { activeColor } from "../../utils/Constants";
import { reactiveClassName } from '../Renderer/helper/PropsHelper';
class Dropable extends React.PureComponent {
    getClassName() {
        const { preview } = this.props;
        return `${this.dropTargetClassName} ${reactiveClassName(preview)}`;
    }
    bindEventContext() {
        this.onDrop = this.onDrop.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDragenter = this.onDragenter.bind(this);
    }
    isDropValid() {
        return this?.dropContainer?.current;
    }
    addEvent() {
        if (this.isDropValid()) {
            this.isAddEvent = true;
            const dropTarget = this.dropContainer.current;
            dropTarget.addEventListener("drop", this.onDrop, false);
            dropTarget.addEventListener("dragleave", this.onDragLeave, false);
            dropTarget.addEventListener("dragenter", this.onDragenter, false);
        }
    }
    removeEvent() {
        if (this.isDropValid()) {
            this.isAddEvent = false;
            const dropTarget = this.dropContainer.current;
            dropTarget.removeEventListener("drop", this.onDrop);
            dropTarget.removeEventListener("dragleave", this.onDragLeave);
            dropTarget.removeEventListener("dragenter", this.onDragenter);
        }
    }
    didMount() {
      this.addEvent();
    }
    beforeUnmount() {
        this.removeEvent();
    }
    resetBg() {
        const dropDomArr = document.querySelectorAll(`.${this.dropTargetClassName}`);
        if (dropDomArr) {
            dropDomArr.forEach((item) => {
                item.style.background = "";
            });
        }
    }
    isAcceptDropComponent() {
        if (typeof this.isForbidDrop === 'function') { // 是否容许放置拖拽组件
            return this.isForbidDrop();
        }
        return true;
    }
    isDropWork(event) {
        return this.isTarget(event) && this.isAcceptDropComponent();
    }
    onDragenter(event) {
        if (this.isDropWork(event)) {
            event.target.style.background = activeColor;
        }
    }
    onDragLeave(event) {
        if (this.isDropWork(event)) {
            event.target.style.background = "";
        }
    }
    onDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.isDropWork(event)) {
            return;
        }
        this.resetBg();
        const data = JSON.parse(event.dataTransfer.getData("text/plain"));
        const { component, isTemplatePage = false } = data;
        if (this.forbiddenDropType && ~this.forbiddenDropType.indexOf(component)) {
            message.warn(`当前容器不支持${component}类型的组件!`);
            return;
        }
        if (isTemplatePage) { // 模板页
            if (this.state?.rootConfigs?.children?.length === 0) {
                this.setState({
                    rootConfigs: data,
                });
                return;
            }
            message.warn("请先清空工作台");
            return;
        }
        if (component) {
            this.updateChildConfig(Object.assign({ uid: this.uid++ }, data));
        }
    }
    isTarget(event) {
        return event.target.className && event.target.className.indexOf(this.dropTargetClassName) >= 0;
    }
    updateChildConfig(childConfig, effectTag) {
        if (this.state?.rootConfigs) {
            const { rootConfigs } = this.state;
            const _rootConfigs = Object.assign({}, rootConfigs);
            const locIndex = _rootConfigs.children.findIndex(({ uid }) => {
                return uid == childConfig.uid;
            });
            if (locIndex < 0) {
                childConfig.return = _rootConfigs;
                _rootConfigs.children.push(childConfig);
            } else {
                if (effectTag === DELETE) {
                    _rootConfigs.children.splice(locIndex, 1);
                } else {
                    _rootConfigs.children[locIndex] = childConfig;
                }
            }
            this.setState({
                rootConfigs: _rootConfigs,
            });
        } else {
            childConfig.return = this.props.configs || this.props.parent;
            this.context.onUpdateRootConfigs(childConfig, effectTag);
        }
    }
}

export default Dropable;