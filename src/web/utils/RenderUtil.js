import React from 'react';
import { Button, Checkbox, Input, Icon, Tabs, Select, DatePicker, Breadcrumb, Radio, Form } from 'antd';
import FormContainer from '../component/Container/FormContainer';
import LineContainer from '../component/Container/LineContainer';
import TableContainer from '../component/Container/TableContainer';
import BoxContainer from '../component/Container/BoxContainer';
import HeaderContainer from '../component/Container/HeaderContainer';
import { isIndex } from './common';

const CheckboxGroup = Checkbox.Group;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;

const renderComponent = (renderConfig, props) => {
    const { placeholder = '', component } = renderConfig;
    let element = null;
    switch(component) {
        case 'Text':
            element = renderText(renderConfig);
            break;
        case 'Breadcrumb':
            element = renderBreadcrumb(renderConfig);
            break;
        case 'Select':
            element = renderSelect(renderConfig);
            break;
        case 'RangePicker':
            element = renderRangePicker(renderConfig);
            break;
        case 'DatePicker':
            element = renderDatePicker(renderConfig);
            break;
        case 'Radio':
            element = renderRadio(renderConfig);
            break;
        case 'Checkbox':
            element = renderCheckbox(renderConfig);
            break;
        case 'Tabs':
            element = renderTabs(renderConfig);
            break;
        case 'Button':
            element = renderBtn(renderConfig, props);
            break;
        case 'FormContainer':
            element = renderForm(renderConfig, props);
            break;
        case 'LineContainer':
            element = renderLine(renderConfig, props);
            break;
        case 'TableContainer':
            element = renderTable(renderConfig, props);
            break;
        case 'BoxContainer':
            element = renderBox(renderConfig, props);
            break;
        case 'HeaderContainer':
            element = renderHeader(renderConfig, props);
            break;
        case 'TextArea':
            element = renderTextArea(renderConfig);
            break;
        case 'Input':
            element = (<Input placeholder={placeholder} />);
            break;
        default:
            break;
    }
    return element;
};

const renderTextArea = (configs) => {
    const { colIndex, dropIndex, originSpan, layoutIndex, cellStyles, hasLinkage,  ...rest } = configs;
    return (<TextArea {...rest} />);
};

const renderForm = (configs, props) => {
    return (<FormContainer configs={configs} {...props} />);
};

const renderHeader = (configs, props) => {
    return (<HeaderContainer {...configs} {...props} />);
};

const renderTable = (configs, props) => {
    return (<TableContainer configs={configs} {...props} />);
};

const renderLine = (configs, props) => {
    return (<LineContainer configs={configs} {...props} />)
};

const renderBox = (configs, props) => {
    return (<BoxContainer configs={configs} {...props} />);
};

const renderBreadcrumb = (configs) => {
    const { breadcrumbArr = [], style } = configs;
    return (
        <Breadcrumb style={style}>
            {
                breadcrumbArr.map(({ label, value }, i) => {
                    return (
                        <Breadcrumb.Item key={`breadcrumb-${i}`}>
                            { value ? 
                                <a href={value}>{label}</a> : <span>{label}</span>
                            }
                        </Breadcrumb.Item>
                    );
                })
            }
        </Breadcrumb>
    )
};
const renderText = (configs) => {
    const { text, style } = configs;
    return (
        <span style={style}>{text}</span>
    );
};
const renderRadio = (configs) => {
    const { style = {}, radioArr = [], radioType } = configs;
    const RadioItem = radioType === 'tab' ? Radio.Button : Radio;
    return (
        <Radio.Group style={{ ...style }}>
            {
                Array.isArray(radioArr) ? radioArr.map(({ key, label, value }) => {
                    return (
                        <RadioItem
                            key={key || value}
                            value={value}
                        >
                            {label}
                        </RadioItem>
                    );
                }) : null
            }
        </Radio.Group>
    );
};
const renderTabs = (configs) => {
    const { style = {}, tabsArr = [] } = configs;
    return (
        <Tabs style={style}>
            {
                Array.isArray(tabsArr) ? tabsArr.map(({ key, label, value }) => {
                    return (
                        <TabPane
                            key={key || value}
                            tab={label}
                        >

                        </TabPane>
                    );
                }) : null
            }
        </Tabs>
   );
};
const renderCheckbox = (configs) => {
    const { style = {}, checkboxArr = [] } = configs;
    if (Array.isArray(checkboxArr)) {
        return (
            <CheckboxGroup options={checkboxArr} style={{ width: "100%", ...style }} />
        );
    }
    return null;
};
const renderSelect = (configs) => {
    const { style = {}, options, selectArr, ...rest } = configs;
    const finalOptions = Object.hasOwnProperty.call(configs, 'options') ? configs.options : configs.selectArr;
    return (
        <Select style={{ width: '100%', ...style }} {...rest}>
            {
                Array.isArray(finalOptions) ? finalOptions.map(({ key, label, value }) => {
                    return (
                        <Option
                            key={key || value}
                            value={value}
                        >
                            {label}
                        </Option>
                    );
                }) : null
            }
        </Select>
    );
};
const renderDatePicker = (configs) => {
    const { showTime, format } = configs;
        return (
            <DatePicker
                style={{ width: '100%' }}
                showTime={showTime}
                format={format}
            />
        );
};
const renderRangePicker = (configs) => {
    const { showTime, format } = configs;
        return (
            <RangePicker
                showTime={showTime}
                format={format}
                style={{ width: '100%' }}
            />
        );
}
/**
 * @desc 获取按钮disabled属性
 */
const getMultBtnDisabled = (logicType, selectedRowKeys) => {
    if (logicType === 'mult') {
        const isEnabled = Array.isArray(selectedRowKeys) && selectedRowKeys.length > 0;
        return !isEnabled;
    }
    return false;
};

const renderBtn = (configs, { context, onResetForm }) => {
    const { buttonArr = [] } = configs;
    const { state, onCollapse } = context || {};
    const { expand = true } = state;
    const { GuiContext } = context;
    return (
        <GuiContext.Consumer>
            {
                ({ selectedRowKeys }) =>
                    <span className="btn-group">
                        {
                            buttonArr.map((btnConfig) => {
                                const { logicType, btnText, expandCount, api, modalName, antdType, skipUrl,
                                    style = {}, textDisabled, btnIndex, ...btnProps } = btnConfig;
                                if (logicType === 'expand') {
                                    const collapseBtnText = expand ? '收起' : '展开';
                                    return (
                                        <span
                                            className="fulu-btn-collapse"
                                            onClick={onCollapse}
                                            style={style}
                                            key={`btn-${btnIndex}`}
                                        >
                                            {collapseBtnText}
                                            <Icon type={expand ? 'up' : 'down'} />
                                        </span>
                                        );
                                }
                                if (btnConfig.htmlType !== 'submit') {
                                    btnProps.onClick = (e) => {
                                        if (context) {
                                            if (btnConfig.htmlType === 'reset') {
                                                onResetForm();
                                            } else if (modalName) {
                                                context.onShowModal(e, modalName, api);
                                            } else if (logicType === 'mult') {
                                                context.execFetchApi(api, {}, logicType);
                                            } else if (logicType === 'skip') {
                                                window.location = skipUrl;
                                            }
                                        }
                                    };
                                }
                                
                                return (
                                    <Button
                                        key={`btn-${btnIndex}`}
                                        style={style}
                                        type={antdType}
                                        {...btnProps}
                                        disabled={getMultBtnDisabled(logicType, selectedRowKeys)}
                                    >
                                        {btnText}
                                    </Button>
                                );
                            })
                        }
                    </span>
            }
        </GuiContext.Consumer>
    );
}

const renderConfigForm = (form, renderConfig, initData = {}) => {
    const { getFieldDecorator } = form;
    const hasIndex = isIndex(initData.index);
    if (Array.isArray(renderConfig)) {
        return renderConfig.map((cf) => {
            const { label, key, rules = [], initialValue, required, renderCondition } = cf;
            if (renderCondition) { // 有渲染条件限制
                const { name, value } = renderCondition;
                const itemName = hasIndex ? `${name}-${initData.index}` : name;
                if (form.getFieldValue(itemName) !== value) {
                    return null;
                }
            }
            if (required) {
                rules.push({
                    required: true, message: `请输入${label}`,
                });
            }
            return (
                <Form.Item label={label} key={`${key}-item`}>
                    {getFieldDecorator(hasIndex ? `${key}-${initData.index}` : key, {
                            rules,
                            initialValue: initData[key] || initialValue,
                        })(renderComponent(cf))}
                </Form.Item>
            );
        });
    }
    return null;
};

const renderModalSelect = (layerConfig = {}, form, initialValue, key = '') => {
    const keyStr = `${key}`;
    const { modalArr = [] } = layerConfig;
    if (modalArr.length === 0) {
        return null;
    }
    const formItemKey = keyStr ? `modal-item-${keyStr}` : 'modal-item';
    const formNameKey = keyStr ? `modalName-${keyStr}` : 'modalName';
    return (
        <Form.Item
            key={formItemKey}
            label="打开modal"
        >
            {form.getFieldDecorator(formNameKey, {
                rules: [{ required: true, 'message': 'modal' }],
                initialValue,
            })(
                <Select placeholder="modal">
                    {
                        modalArr.map(({ index, name }) => {
                            return (
                                <Option key={`modalName-${index}`} value={name}>{name}</Option>
                            )
                        })
                    }
                </Select>
            )}
        </Form.Item>
    );
};

const renderApiSelect = (layerConfig = {}, form, compData) => {
    const { initialValue, key = '', label = '调用api', apiName } = compData;
    const keyStr = `${key}`;
    const { apiArr = [] } = layerConfig;
    if (apiArr.length === 0) {
        return null;
    }
    const formItemKey = apiName ? `api-item-${apiName}` : keyStr ? `api-item-${keyStr}` : 'modal-item';
    const formNameKey = apiName ? apiName : keyStr ? `api-${keyStr}` : 'api';
    return (
        <Form.Item
            key={formItemKey}
            label={label}
        >
            {form.getFieldDecorator(formNameKey, {
                rules: [{ required: true, 'message': 'api' }],
                initialValue,
            })(
                <Select placeholder="api">
                    {
                        apiArr.map(({ index, requestApi }) => {
                            return (
                                <Option key={`api-${index}`} value={requestApi}>{requestApi}</Option>
                            )
                        })
                    }
                </Select>
            )}
        </Form.Item>
    );
};

export default renderComponent;

export {
    renderModalSelect,
    renderApiSelect,
    renderConfigForm,
};