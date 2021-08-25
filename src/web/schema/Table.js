export default {
    name: 'Table',
    component: 'Table',
    editProps: {
        requestApi: {
            label: '调用接口',
            type: 'Select',
            options: 'return this.props.pageApiQueue;',
            transformData: 'return { value: uid, label: `${url}(${method})` };',
        },
        arrayTypeProps: [{
            arrayTypeValue: 'columns',
            dataIndex: {
                label: 'dataIndex',
                type: 'Input',
                rules: [{
                    required: true,
                    message: '请输入',
                }],
            },
            title: {
                label: 'title',
                type: 'Input',
                rules: [{
                    required: true,
                    message: '请输入',
                }],
            },
            width: {
                label: 'width',
                type: 'Input',
                formatData: 'if (width) { return parseFloat(width); } return width;',
            },
            fixed: {
                label: 'fixed',
                type: 'Select',
                options: ['left', 'right'],
            },
            align: {
                label: 'align',
                type: 'Select',
                options: ['left', 'right', 'center'],
            },
            ellipsis: {
                label: 'ellipsis',
                type: 'Boolean',
            },
        }, {
            arrayTypeValue: 'operations',
            arrayTypeLabel: '操作栏列管理',
            title: {
                label: 'title',
                type: 'Input',
                rules: [{
                    required: true,
                    message: '请输入',
                }],
            },
            type: {
                label: 'type',
                type: 'Select',
                options: ['delete', 'edit'],
            },
            confirmText: {
                label: 'confirmText',
                type: 'Input',
                isRender: 'this.props.form.getFieldValue("type") === "delete"',
                value: '确定删除？',
            },
            deleteRequestApi: {
                label: '删除接口',
                type: 'Select',
                options: 'return this.props.pageApiQueue;',
                isRender: 'this.props.form.getFieldValue("type") === "delete"',
                transformData: 'return { value: uid, label: `${url}(${method})` };',
            },
            target: {
                label: '弹窗',
                type: 'Select',
                options: 'return this.props.pageModalQueue;',
                transformData: 'return { value: name, label: name };',
                isRender: 'this.props.form.getFieldValue("type") !== "delete"',
            }
        }],
        operationTitle: {
            label: '操作栏title',
            type: 'Input',
            value: '操作',
        },
        operationWidth: {
            label: '操作栏width',
            type: 'Number',
        },
        operationFixed: {
            label: '操作栏Fixed',
            type: 'Select',
            options: ['left', 'right'],
        },
        rowKey: {
            label: 'rowKey',
            type: 'Input',
        },
        bordered: {
            label: 'bordered',
            type: 'Boolean',
        },
        pagination: {
            label: 'pagination',
            type: 'Boolean',
            value: true,
        },
        // defaultPageSize: {
        //     label: 'defaultPageSize',
        //     type: 'Number',
        //     value: 10,
        //     isRender: 'this.props.form.getFieldValue("pagination") === true',
        // },
        pageSize: {
            label: 'pageSize',
            type: 'Number',
            value: 10,
            isRender: 'this.props.form.getFieldValue("pagination") === true',
        },
        pageSizeOptions: {
            label: 'pageSizeOptions',
            type: 'Input',
            value: '10,20,30,40',
            isRender: 'this.props.form.getFieldValue("pagination") === true',
        },
        showQuickJumper: {
            label: 'showQuickJumper',
            type: 'Boolean',
            isRender: 'this.props.form.getFieldValue("pagination") === true',
        },
        showSizeChanger: {
            label: 'showSizeChanger',
            type: 'Boolean',
            isRender: 'this.props.form.getFieldValue("pagination") === true',
        },
        rowSelection: {
            label: 'rowSelection',
            subEditProps: {
                formItemLayout: {
                    labelCol: {
                        span: 14,
                    },
                    wrapperCol: {
                        span: 10,
                    },
                },
                columnWidth: {
                    label: 'columnWidth',
                    type: 'Input',
                },
                columnTitle: {
                    label: 'columnTitle',
                    type: 'Input',
                    value: '60px',
                },
                getCheckboxProps: {
                    label: 'getCheckboxProps',
                    type: 'TextArea',
                },
            },
        },
        size: {
            label: 'size',
            type: 'Select',
            options: ['default', 'middle', 'small'],
        },
        tableLayout: {
            label: 'tableLayout',
            type: 'Select',
            options: ['auto', 'fixed'],
        }
    }
}