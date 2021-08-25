import React, { Fragment } from 'react';
import { Divider, Dropdown, Icon } from 'antd';
import { TRUE } from './Constants';

const renderMoreOpList = (opList) => {
    return (
        <span style={{ background: '#fff', display: 'block' }}>
            {
                opList.map(({opText, index}) => {
                return (
                    <a href="&nbsp;" key={`op-${index}`} style={{ display: 'block' }}>
                        {opText}
                    </a>
                );
                })
            }
        </span>
    );
}

const renderMultOperation = (operationArr) => {
    const [ firstItem, ...restItemArr ] = operationArr;
    return (
        <Fragment>
            <a href="&nbsp;">
                {firstItem.opText}
            </a>
            <Divider type="vertical" />
            <Dropdown overlay={renderMoreOpList(restItemArr)}>
                <a className="ant-dropdown-link" href="&nbsp;">
                    更多<Icon type="down" />
                </a>
            </Dropdown>
        </Fragment>
    );
}
const renderNormalOperation = (operationArr) => {
    const resultArr = [];
    operationArr.forEach(({ opText, index }, i) => {
        resultArr.push((
            <Fragment key={`fr-${index}`}>
                <a href="&nbsp;" key={`op-${index}`}>{opText}</a>
                {
                    i !== operationArr.length -1
                        ? <Divider type="vertical" /> : null
                }
            </Fragment>)
        );
    });
    return resultArr;
}

const handleOperation = (columns = [], operationArr = [], context) => {
    let opCol = null;
    if (columns.length > 0 && columns[columns.length -1].title === '操作') {
        opCol = columns[columns.length -1];
    } else {
        opCol = {
            title: '操作',
            dataIndex: 'operation',
        };
        columns.push(opCol);
    }
    opCol.render = (text, record) => {
        if (!Array.isArray(operationArr)) {
            return null;
        }
        return (
            <Fragment>
                {
                    operationArr.map(({ opText, opType, modalName, api = '', skipUrl }, i) => {
                        const clickProps = {};
                        if (opType === 'edit' || opType === 'view') {
                            clickProps.onClick = (e) => {
                                context.onShowModal(e, modalName, api, record);
                            };
                        } else if (opType === 'skip') { // 跳转
                            clickProps.onClick = (e) => {
                                window.location = skipUrl;
                            };
                        } else { // 删除
                            clickProps.onClick = (e) => {
                                context.props.execFetchApi(api, record);
                            };
                        }
                        return (
                            <>
                                <a href="javascript:;" key={`op-${i}`} {...clickProps}>
                                    {opText}
                                </a>
                                { i !== operationArr.length - 1 ? <Divider type="vertical" /> : null }
                            </>
                        );
                    })
                }
            </Fragment>
        );
        // if (operationArr.length > 2) {
        //     return (
        //         <span>
        //             {
        //                 renderMultOperation(operationArr)
        //             }
        //         </span>
        //     );
        // } else {
        //     return (
        //         <span>
        //             {
        //                 renderNormalOperation(operationArr)
        //             }
        //         </span>
        //     );
        // }
    };
    return columns;
}

const handleColumns = (values, configs, context) => {
    const { operationArr = [], columns } = configs;
    const newColumns = columns.slice();
    Object.keys(values).forEach((k) => {
        const val = values[k];
        // 常规数据列
        if (k.indexOf('-') > 0) {
            const [ columnName, columnIndex ] = k.split('-');
            const columnTarget = newColumns.find((item) => {
                return item.index === +columnIndex;
            });
            if (columnTarget) {
                columnTarget[columnName] = val;
                if (columnName === 'width' && !val) {
                    delete columnTarget.width;
                }
                if (columnName === 'fixed') {
                    columnTarget[columnName] = TRUE === val;
                }
                delete values[k];
            }
        }
    });
    if (values.hasOperation === TRUE) {
        return handleOperation(newColumns, operationArr, context); 
    }
    // 序号列渲染处理
    if (newColumns.length > 0 && newColumns[0].sortIndex === TRUE) {
        newColumns[0].render = (record, text, index) => {
            return (
                <span>{index + 1}</span>
            );
        };
    }
    return newColumns;
};

const getTableConfig = (values, configs, context) => {
    const columns = handleColumns(values, configs, context);
    const newConfigs = {
        columns,
    };
    Object.keys(values).forEach((k) => {
        const val = values[k];
        if (k === 'pagination') { // 分页
            if (val === TRUE) {
                newConfigs.pagination = {
                    pageSize: values.pageSize,
                    pageSizeOptions: values.pageSizeOptions.split(','),
                };
            } else {
                newConfigs[k] = TRUE === val;
            }
        } else if (k === 'rowSelection') {
            if (val === TRUE) {
                newConfigs.rowSelection = {
                    type: values.type,
                };
                if (values.type === 'radio') {
                    newConfigs.rowSelection.columnTitle = values.columnTitle;
                }
            } else {
                newConfigs[k] = null;
            }
        } else {
            newConfigs[k] = val;
        }
    });
    return newConfigs;
};

export {
    getTableConfig,
}

export default getTableConfig;