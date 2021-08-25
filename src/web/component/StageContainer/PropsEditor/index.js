/**
 * @desc 组件属性编辑器，根据组件schema的editProps控制可编辑的属性
 * @author zhangkegui@fulu.com
 * @date 2o21-7-29
 */
import React from 'react';
import { Drawer, Divider, Form, Button, Table, message } from 'antd';
import { renderEditItemWithoutChildren } from './renderEditItem';
import ChildModal from './ChildModal';
import execute from '../../Renderer/compile';
import './index.css';

const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

function isObject(o) {
    return typeof o ==='object' && o !== null;
}
class PropsEditor extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            editData: null,
            arrayType: '',
            columnsMap: {},
            arrayTypesMap: {},
            arrayTypePropsMap: {},
            showChildModal: false,
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onToggleChildModal = this.onToggleChildModal.bind(this);
    }
    componentDidUpdate(prevProps) {
        if (!prevProps.visible && this.props.visible) {
            const { form, editSchema: { schemaProps, editProps, logicProps } } = this.props;
            if (editProps.arrayTypeProps) {
                const arrayTypesMap = {};
                const columnsMap = {};
                const arrayTypePropsMap = {};
                const arrayTypeProps = editProps.arrayTypeProps;
                const arrayTypePropsQueue = Array.isArray(arrayTypeProps) ? arrayTypeProps : [arrayTypeProps];
                arrayTypePropsQueue.forEach(({ arrayTypeValue, arrayTypeLabel, isRender, ...rest }) => {
                    if (isRender) {
                        if (!execute(this, null, isRender)) {
                            return;
                        }
                    }
                    arrayTypesMap[arrayTypeValue] = schemaProps[arrayTypeValue] || [];
                    // delete schemaProps[arrayTypeValue];
                    const columns = Object.keys(rest).map((k) => {
                        const column = {
                            dataIndex: k,
                            title: rest[k].label,
                        };
                        if (rest[k].type === 'Boolean') {
                            column.render = (text) => {
                                return (
                                    <span>{text == null ? '' : String(text)}</span>
                                );
                            };
                        }
                        return column;
                    });
                    columns.push({
                        title: '操作',
                        width: 80,
                        render: (_, record) => {
                            return (
                                <>
                                    <a
                                        onClick={() => {
                                            this.setState({
                                                editData: record,
                                                showChildModal: true,
                                                arrayType: arrayTypeValue,
                                            });
                                        }}
                                    >
                                        编辑
                                    </a>
                                    &nbsp;&nbsp;
                                    <a
                                        onClick={() => {
                                            const { arrayTypesMap } = this.state;
                                            arrayTypesMap[arrayTypeValue] = arrayTypesMap[arrayTypeValue].reduce((arr, item) => {
                                                if (item.uid !== record.uid) {
                                                    arr.push(item);
                                                }
                                                return arr;
                                            }, []);
                                            this.setState({
                                                arrayTypesMap: Object.assign({}, arrayTypesMap)});
                                        }}
                                    >
                                        删除
                                    </a>
                                </>
                            );
                        }
                    });
                    columnsMap[arrayTypeValue] = columns;
                    arrayTypePropsMap[arrayTypeValue] = rest;
                });
                this.setState({
                    columnsMap,
                    arrayTypesMap,
                    arrayTypePropsMap,
                });
            }
            const initValues = Object.assign({}, schemaProps, logicProps);
            form.setFieldsValue(Object.keys(form.getFieldsValue()).reduce((obj, k) => {
                if (k !== 'arrayTypeProps') {
                    obj[k] = initValues[k];
                }
                return obj;
            }, {}));
            setTimeout(() => {
                if (this?.props?.form && logicProps) {
                    const { form } = this.props;
                    form.setFieldsValue(Object.keys(logicProps).reduce((obj, k) => {
                        if (!form.getFieldValue(k) && logicProps[k]) {
                            obj[k] = logicProps[k];
                        }
                        return obj;
                    }, {}));
                }
            });
        }
    }
    collectNestValues(keyMap, values) {
        const props = Object.keys(keyMap).reduce((obj, k) => {
            if (Array.isArray(keyMap[k])) {
                keyMap[k].forEach(({ key }) => {
                    if (values.hasOwnProperty(key)) {
                        obj[key] = values[key];
                        delete values[key];
                    }
                });
            } else if (!isObject(keyMap[k])) {
                obj[k] = keyMap[k];
            } else {
                obj[k] = values[k];
                delete values[k];
            }
            if (keyMap[k].reactive) {
                Object.assign(obj, this.collectNestValues(keyMap[k].reactive, values));
            }
            return obj;
        }, {});
        return props;
    }
    onSubmit(e) {
        e.preventDefault();
        const { form, onClose, editSchema } = this.props;
        form.validateFields((err, values) => {
            if (!err) {
                const { arrayTypesMap } = this.state;
                const { logicControll = {} } = editSchema;
                const logicProps = this.collectNestValues(logicControll, values);
                onClose(e, Object.assign({}, editSchema, {
                    logicProps,
                    schemaProps: Object.assign(values, arrayTypesMap),
                }));
            }
        });
    }
    /**
     * @desc 添加子组件的弹窗
     */
    onToggleChildModal(_, data) {
        this.setState({
            showChildModal: !this.state.showChildModal,
        });
        if (data) {
            const { editData, arrayType, arrayTypesMap, arrayTypePropsMap } = this.state;
            const list = arrayTypesMap[arrayType];
            const i = list.findIndex((item) => {
                return item.uid === editData?.uid;
            });
            const arrayTypeProps = arrayTypePropsMap[arrayType];
            Object.keys(arrayTypeProps).forEach((k) => {
                if (arrayTypeProps[k].formatData) {
                    data[k] = execute(data, null, arrayTypeProps[k].formatData);
                }
            });
            if (i >= 0) {
                list[i] = Object.assign(list[i], data);
            } else {
                list.push(Object.assign({ uid: Date.now() }, data));
            }
            this.setState({
                arrayTypesMap: Object.assign({}, arrayTypesMap),
                editData: null,
            });
        }
    }
    renderEditItem(propKey, editPropObj) {
        // 还有子组件，需要支持添加、删除、编辑
        if (propKey === 'arrayTypeProps') {
            const { arrayTypesMap, columnsMap } = this.state;
            const editPropQueue = Array.isArray(editPropObj) ? editPropObj : [editPropObj];
            return editPropQueue.map(({ arrayTypeValue, arrayTypeLabel }) => {
                if (!columnsMap[arrayTypeValue]) {
                    return null;
                }
                return (
                    <React.Fragment key={`${propKey}-${arrayTypeValue}`}>
                        <Divider>
                            {arrayTypeLabel || arrayTypeValue}
                            <Button
                                size="small"
                                style={{
                                    marginLeft: '5px',
                                }}
                                onClick={() => {
                                    this.onToggleChildModal();
                                    this.setState({
                                        editData: null,
                                        arrayType: arrayTypeValue,
                                    });
                                }}
                            >+</Button>
                        </Divider>
                        <Table
                            rowKey="uid"
                            size="small"
                            pagination={false}
                            columns={columnsMap[arrayTypeValue]}
                            dataSource={arrayTypesMap[arrayTypeValue]}
                        />
                        <Divider />
                    </React.Fragment>
                );
            });
        }
        return renderEditItemWithoutChildren(propKey, editPropObj, this);
    }
    renderEditProps() {
        const { editSchema /*组件对应的schema中的配置项*/ } = this.props;
        const { editProps } = editSchema || {};
        if (editProps == null) {
            return null;
        }
        return Object.keys(editProps).map((propKey) => {
            return this.renderEditItem(propKey, editProps[propKey]);
        });
    }
    renderLogicControllProps() {
        const { editSchema } = this.props;
        const { logicControll } = editSchema || {};
        if (logicControll == null) {
            return null;
        }
        return Object.keys(logicControll).map((propKey) => {
            if (typeof logicControll[propKey] === 'object') {
                return this.renderEditItem(propKey, logicControll[propKey]);
            }
            return null;
        });
    }
    render() {
        const { showChildModal, arrayType, arrayTypePropsMap } = this.state;
        const { editSchema, visible, onClose, form, pageModalQueue, pageApiQueue } = this.props;
        return (
            <>
                <Drawer
                    onClose={onClose}
                    visible={visible}
                    className="props-editor"
                    title={`编辑${editSchema?.name}`}
                    width={editSchema?.name === 'Table' ? 650 : 450}
                    afterVisibleChange={(visible) => {
                        if (!visible) {
                            form.resetFields();
                            this.setState({
                                arrayType: '',
                                columnsMap: {},
                                arrayTypesMap: {},
                                arrayTypePropsMap: {},
                            });
                        }
                    }}
                >
                    <Form {...formItemLayout}>
                        {this.renderEditProps()}
                        {this.renderLogicControllProps()}
                    </Form>
                    <div className="btn-box">
                        <Button
                            type="primary"
                            htmlType="submit"
                            onClick={this.onSubmit}
                        >
                            确定
                        </Button>
                        <Button
                            onClick={onClose}
                            style={{
                                marginLeft: '15px',
                            }}
                        >
                            取消
                        </Button>
                    </div>
                </Drawer>
                <ChildModal
                    visible={showChildModal}
                    pageApiQueue={pageApiQueue}
                    editData={this.state.editData}
                    pageModalQueue={pageModalQueue}
                    onClose={this.onToggleChildModal}
                    configs={arrayTypePropsMap[arrayType]}
                />
            </>
        );
    }
}

export default Form.create()(PropsEditor);
