import moment from 'moment';
import { Form, Row, message, Icon } from 'antd';
import React, { PureComponent, Fragment } from 'react';
import ActionBar from '../ActionBar';
import FormItemRender from './FormItemRender';
import { FormItemSchema } from '../../../schema';
import AppContext from '../../../shared/AppContext';
import { renderTag } from '../helper/RenderHelper';
import { reactiveClassName, getNestProps } from '../helper/PropsHelper';
import './index.css';

class FormRender extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            fetchLoading: false,
        };
        this.uid = props.configs.schemaProps.col;
        this.onSubmit = this.onSubmit.bind(this);
        this.onAddFormItem = this.onAddFormItem.bind(this);
        this.renderFormItems = this.renderFormItems.bind(this);
    }
    componentDidMount() {
        this.initApiFormLink();
    }
    componentDidUpdate() {
        this.initApiFormLink();
    }
    componentWillUnmount() {
        const linkApiQueue = this.getLinkApis();
        if (this.props.configs?.logicProps?.requestApi) {
            linkApiQueue.push(this.props.configs.logicProps.requestApi);
        }
        if (linkApiQueue.length > 0) {
            const { linkApiAndForm } = this.context.global;
            linkApiAndForm && linkApiQueue.forEach((api) => {
                linkApiAndForm(api, null);
            });
        }
    }
    initApiFormLink() {
        const linkApiQueue = this.getLinkApis();
        if (this.props.configs?.logicProps?.requestApi) {
            const { configs } = this.props;
            // form对象挂载到global中，便于接口入参收集
            linkApiQueue.push(configs.logicProps.requestApi);
        }
        if (linkApiQueue.length > 0) {
            const { linkApiAndForm } = this.context.global;
            linkApiAndForm && linkApiQueue.forEach((api) => {
                linkApiAndForm(api, this.props.form);
            });
        }
    }
    getLinkApis() {
        const linkApiQueue = [];
        const rootConfigs = this.getRootConfigs(this.props.configs);
        if (rootConfigs?.wrapModal) {
            ['addRequestApi', 'editRequestApi', 'initRequestApi'].forEach((apiKey) => {
                rootConfigs.wrapModal[apiKey] && linkApiQueue.push(rootConfigs.wrapModal[apiKey]);
            });
        }
        return linkApiQueue;
    }
    getRootConfigs(configs) {
        let rootConfigs = null;
        while((configs = configs?.return)) {
            if (configs.uid === -1) {
                rootConfigs = configs;
                break;
            }
            configs = configs.return;
        }
        return rootConfigs;
    }
    onAddFormItem() {
        const newFormItemSchema = Object.assign({}, FormItemSchema);
        newFormItemSchema.uid = this.uid++;
        newFormItemSchema.editProps.submitId.value = Date.now();
        newFormItemSchema.return = this.props.configs;
        const { onUpdateRootConfigs } = this.context;
        onUpdateRootConfigs(newFormItemSchema);
    }
    searchDatePickerConfig(submitId) {
        const { configs: { children = [] } } = this.props;
        const searchQueue = [...children];
        let result = null;
        while(searchQueue.length > 0) {
            let current = searchQueue.shift();
            if (current.schemaProps?.submitId == submitId) {
                result = current;
                break;
            }
            if (Array.isArray(current.children)) {
                searchQueue.push(...current.children);
            }
        }
        return result;
    }
    transferDateValues(values) {
        const defaultFormat = 'YYYY-MM-DD';
        Object.entries(values).forEach(([k, v]) => {
            if (moment.isMoment(v)) {
                const formatStr = this.searchDatePickerConfig(k)?.schemaProps?.format || defaultFormat;
                values[k] = v.format(formatStr);
            }
        });
    }
    /**
     * @desc 表单提交事件
     * @param {*} e 
     */
    onSubmit(e) {
        e.preventDefault();
        const { form, configs } = this.props;
        form.validateFields((err, values) => {
            if (!err) {
                const { global } = this.context;
                if (configs?.logicProps?.requestApi) {
                    global.executeRequestApi(configs.logicProps.requestApi, this.transferDateValues(values));
                    return;
                }
                const rootConfigs = this.getRootConfigs(this.props.configs);
                if (rootConfigs?.wrapModal) { // 如果form放置在Modal内部
                    return;
                }
                message.warn('请配置form的依赖接口');
            }
        });
    }
    renderFormItems() {
        const { form, preview, configs } = this.props;
        const { schemaProps, children } = configs;
        const { col } = schemaProps;
        return children.map((itemConfigs) => {
            const { uid } = itemConfigs;
            if (!itemConfigs.return) { // 建立与父级配置的关系
                itemConfigs.return = this.props.configs;
            }
            return (
                <FormItemRender
                    key={uid}
                    col={col}
                    form={form}
                    preview={preview}
                    configs={itemConfigs}
                />
            );
        });
    }
    render() {
        const { preview, configs } = this.props;
        const { schemaProps, logicProps } = configs;
        const { col, layout } = schemaProps;
        const { onShowPropsEditor, onDeleteConfig } = this.context;
        return (
            <Fragment>
                <div className={`form-container block drop-container ${reactiveClassName(preview)}`}>
                    {renderTag(configs.name, preview, logicProps?.requestApi ? 'API' : '')}
                    <div className="inner-box">
                        {
                            <Form
                                layout={layout}
                                onSubmit={this.onSubmit}
                                {...getNestProps(schemaProps)}
                            >
                                <Row gutter={{ md: 24 / col, lg: 24, xl: 48 }}>
                                    {this.renderFormItems()}
                                </Row>
                            </Form>
                        }
                    </div>
                    <ActionBar
                        show={!preview}
                        onEdit={() => {
                            onShowPropsEditor(configs);
                        }}
                        onDelete={() => {
                            onDeleteConfig(configs);
                        }}
                    >
                        <Icon
                            type="plus"
                            title="新增单元格"
                            onClick={this.onAddFormItem}
                            className="edit-icon icon-form"
                        />
                    </ActionBar>
                </div>
            </Fragment>  
        );
    }
}
FormRender.contextType = AppContext;

export default Form.create()(FormRender);