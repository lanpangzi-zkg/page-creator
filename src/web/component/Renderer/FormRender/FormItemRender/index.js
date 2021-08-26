import React from 'react';
import { Col } from 'antd';
import InnerRender from './InnerRender';
import ActionBar from '../../ActionBar';
import Dropable from '../../../Core/Dropable';
import AppContext from '../../../../shared/AppContext';
import { reactiveClassName } from '../../helper/PropsHelper';
import './index.css';
class FormItemRender extends Dropable {
    constructor(props) {
        super(props);
        this.uid = 0;
        this.dropContainer = React.createRef();
        this.dropTargetClassName = `form-item-drop-${Date.now()}`;
        this.bindEventContext();
    }
    componentDidMount() {
        this.didMount();
    }
    componentWillUnmount() {
        this.beforeUnmount();
    }
    getContainerWidth() {
        return `${100 * this.getSpan() / 24 }%`;
    }
    /**
     * @desc 是否禁止放置拖拽组件
     */
    isForbidDrop() {
        return this.isAllowMultipleChildren();
    }
    /**
     * @desc canWrapFieldDecorator为true，表示该组件可以被getFieldDecorator包裹，
     *       那么这个FormItem内部只能容许放置一个子组件
     */
    isAllowMultipleChildren() {
        const { configs } = this.props;
        if (Array.isArray(configs?.children)) {
            const container = configs.children.find(({ isContainer }) => {
                return Boolean(isContainer);
            });
            if (container) { // 如果包含容器组件，则只能放置这个容器组件
                return false;
            }
            return !configs.children.find(({ canWrapFieldDecorator }) => {
                return Boolean(canWrapFieldDecorator);
            });
        }
        return true;
    }
    getContainerClassName(preview) {
        const classNameQueue = [
            'drop-container',
            this.dropTargetClassName,
            reactiveClassName(preview)
        ];
        if (this.isAllowMultipleChildren()) {
            classNameQueue.push('multiple');
        } else {
            classNameQueue.push('single');
        }
        return classNameQueue.join(' ');
    }
    getSpan() {
        const { col, configs } = this.props;
        const { schemaProps } = configs;
        return 24 * (Math.min(schemaProps?.colspan || 1, col)) / col;
    }
    renderChildren() {
        const { configs: parentConfigs } = this.props;
        if (Array.isArray(parentConfigs.children)) {
            return (
                <Col>
                    {
                        parentConfigs.children.map((configs) => {
                            return (
                                <div
                                    key={configs.uid}
                                    className="child-item"
                                >
                                    <InnerRender
                                        {...this.props}
                                        configs={configs}
                                        parentConfigs={parentConfigs}
                                    />
                                </div>
                            );
                        })
                    }
                </Col>
            );
        }
        return null;
    }
    render() {
        const { col, configs, preview } = this.props;
        const { schemaProps } = configs;
        const { onShowPropsEditor, onDeleteConfig } = this.context;
        return (
            <div
                ref={this.dropContainer}
                style={{
                    width: this.getContainerWidth(col, schemaProps)
                }}
                className={`${this.getContainerClassName(preview)}`}
            >
                <ActionBar
                    show={!preview}
                    onEdit={() => {
                        onShowPropsEditor(configs);
                    }}
                    onDelete={() => {
                        onDeleteConfig(configs);
                    }}
                />
                {this.renderChildren()}
            </div>
        );
    }
}
FormItemRender.contextType = AppContext;
export default FormItemRender;