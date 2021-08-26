import React from 'react';
import execute, { emptyFunc } from '../../compile';
import AppContext from '../../../../shared/AppContext';

function getDisabledProp(global, logicProps) {
    if (logicProps?.disabled) {
        return {
            disabled: execute(global, undefined, logicProps.disabled, false),
        };
    }
    return null;
}

function isValidPropValue(value) {
    return value != null && value != '' && value === value;
}

class BaseRender extends React.PureComponent {
    isChildProps() { // 有一些属于子组件的属性，在渲染的时候需要过滤
        return false;
    }
    getComponentProps() {
        const componentProps = {};
        const { global } = this.context;
        const { rawProps, logicProps, formInjectProps } = this.props;
        const disableProp = getDisabledProp(global, logicProps);
        disableProp && Object.assign(componentProps, disableProp);

        Object.entries(rawProps).reduce((obj, [k, v]) => {
            if (!this.isChildProps(k) && isValidPropValue(v)) {
                obj[k] = v;
            }
            return obj;
        }, componentProps);
        if (logicProps) {
            const { eventType, openModal, requestApi, eventName } = logicProps;
            if (eventName && rawProps.htmlType !== 'submit' && rawProps.htmlType !== 'reset') { // 有绑定事件，但是要把Button为submit和reset过滤掉
                let clickHandler = emptyFunc;
                if (eventType === 'openModal') {
                    clickHandler = () => {
                        global.onShowModal(openModal);
                    };
                } else if (eventType === 'requestApi') {
                    clickHandler = () => {
                        const apiObj = global.getApiById(requestApi);
                        if (apiObj.isPagination) { // 按钮触发的是分页查询
                            // 设置pageIndex = 1
                            global.setState({
                                pageIndex: 1,
                            });
                        }
                        global.executeRequestApi(requestApi);
                    };
                } else if (logicProps[eventName]) { // 自定义事件
                    clickHandler = (e) => execute(global, e, logicProps[eventName] /*自定义表达式*/, emptyFunc);
                }
                componentProps[eventName] = clickHandler;
            }
        }
        if (formInjectProps&& formInjectProps.hasOwnProperty('value') && formInjectProps.onChange) {
            componentProps.value = rawProps.component !== 'DatePicker' ? formInjectProps.value : null;
            if (componentProps.onChange) {
                const handler = componentProps.onChange;
                componentProps.onChange = (...args) => {
                    formInjectProps.onChange(...args);
                    handler(...args);
                };
            } else {
                componentProps.onChange = formInjectProps.onChange;
            }
        }
        if (rawProps.htmlType === 'reset') { // 表单的重置按钮
            
        }
        return componentProps;
    }
    isRenderComponent() {
        const { logicProps } = this.props;
        if (logicProps?.isRender) {
            const { global } = this.context;
            return execute(global, null, logicProps.isRender);
        }
        return true;
    }
}

BaseRender.contextType = AppContext;

export default BaseRender;