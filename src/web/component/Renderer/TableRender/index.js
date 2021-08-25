import React from 'react';
import { Table, Popconfirm, message, Divider } from 'antd';
import ActionBar from '../ActionBar';
import { renderTag } from '../helper/RenderHelper';
import AppContext from '../../../shared/AppContext';
import { reactiveClassName, filterValidProps, getNestProps, separateProps } from '../helper/PropsHelper';
import './index.css';

const paginationPropKeys = ['pageSizeOptions', 'pageSize', 'showQuickJumper', 'showSizeChanger'];
const customPropKeys = ['pagination', 'requestApi', 'operationTitle', 'operationWidth', 'operationFixed',...paginationPropKeys];

function getRowSelection(props) {
    const { rowSelection } = props ? getNestProps(props) : {};
    return rowSelection && Object.keys(rowSelection).length > 0 ? rowSelection : null;
}
function getPagination(props, context) {
    if (props.pagination) {
        const pagination = paginationPropKeys.reduce((obj, k) => {
            if (props[k] != null) {
                if (k === 'pageSizeOptions') {
                    obj[k] = props[k].split(',');
                } else {
                    obj[k] = props[k];
                }
            }
            return obj;
        }, {});
        if (props.requestApi) {
            pagination.onChange = (page, pageSize) => {
                context.onPageChange(page, pageSize, props.requestApi);
            };
            pagination.onShowSizeChange = (current, size) => {
                context.onShowSizeChange(current, size, props.requestApi);
            };
            const apiObj = context.getApiById(props.requestApi);
            if (apiObj && apiObj.modelKey) {
                pagination.total = context.state.apiData[`${apiObj.modelKey}Total`] || 0;
            }
        }
        const { pageIndex } = context.state;
        pagination.current = pageIndex;
        setTimeout(() => {
            context.setState({
                pageSize: pagination.pageSize,
            });
        });
        return pagination;
    }
    return false;
}

class TableRender extends React.PureComponent {
    getDataSource(context, apiId) {
        const apiObj = context.getApiById(apiId);
        if (apiObj && apiObj.modelKey) {
            const dataSource = context.state.apiData[apiObj.modelKey];
            if (Array.isArray(dataSource)) {
                return dataSource;
            }
            if (Array.isArray(dataSource?.list)) {
                return dataSource.list;
            }
        }
        return [];
    }
    operationHandler(type, deleteRequestApi, target, record) {
        const { global } = this.context;
        if (type === 'delete') {
            if (deleteRequestApi) {
                global.executeRequestApi(deleteRequestApi, record); // 删除成功后刷新列表
            } else {
                message.warn('请配置删除接口');
            }
            return;
        }
        if (!target) {
            message.warn('请配置弹窗');
            return;
        }
        global.onShowModal(target, { mode: type, editRecord: record }); // 打开弹窗，传递record和请求的初始化接口
    }
    getColumns(columns, operations, customProps) {
        if (operations.length > 0) {
            const lastColumn = columns[columns.length - 1];
            const { operationTitle, operationWidth, operationFixed } = customProps;
            const operationColumn = {
                title: operationTitle || '操作',
                dataIndex: 'operation',
                render: (_, record) => {
                    return (
                        <React.Fragment>
                            {
                                operations.map(({ title, type, confirmText, deleteRequestApi, target }, i) => {
                                    const key = `${type}${title}`;
                                    if (type === 'delete' && confirmText) {
                                        return (
                                            <React.Fragment key={key}>
                                                <Popconfirm
                                                    title={confirmText}
                                                    key={confirmText}
                                                    onConfirm={() => {
                                                        this.operationHandler(type, deleteRequestApi, target, record);
                                                    }}
                                                    okText="是"
                                                    cancelText="否"
                                                >
                                                    <a href="#">{title}</a>
                                                </Popconfirm>
                                                {i < operations.length - 1 && <Divider type="vertical" key={`${type}${i}`} />}
                                            </React.Fragment>
                                        );
                                    }
                                    return (
                                        <React.Fragment key={key}>
                                            <a
                                                key={title}
                                                onClick={() => {
                                                    this.operationHandler(type, deleteRequestApi, target, record);
                                                }}
                                            >
                                                {title}
                                            </a>
                                            {i < operations.length - 1 && <Divider type="vertical" key={`${type}${i}`} />}
                                        </React.Fragment>
                                    );
                                })
                            }
                        </React.Fragment>
                    );
                },
            };
            if (operationWidth) {
                operationColumn.width = operationWidth;
            }
            if (operationFixed) {
                operationColumn.fixed = operationFixed;
            }
            if (lastColumn?.dataIndex === 'operation') {
                columns[columns.length - 1] = operationColumn;
            } else {
                columns.push(operationColumn);
            }
        }
       return columns;
    }
    render() {
        const { preview, configs } = this.props;
        const { onShowPropsEditor, onDeleteConfig, global } = this.context;
        const { customProps, componentProps } = separateProps(configs?.schemaProps, customPropKeys);
        const { columns = [], operations = [], ...rest } = componentProps;
        return (
            <div className={`action-bar-wrapper block ${reactiveClassName(preview)}`}>
                {renderTag(configs.name, preview, configs?.schemaProps?.requestApi ? 'API' : '')}
                <Table
                    {...filterValidProps(rest)}
                    columns={this.getColumns(columns, operations, customProps)}
                    pagination={getPagination(customProps, global)}
                    rowSelection={getRowSelection(customProps)}
                    dataSource={this.getDataSource(global, customProps.requestApi)}
                />
                <ActionBar
                    show={!preview}
                    onEdit={() => {
                        onShowPropsEditor(configs);
                    }}
                    onDelete={() => {
                        onDeleteConfig(configs);
                    }}
                />
            </div>
        );
    }
}

TableRender.contextType = AppContext;

export default TableRender;
