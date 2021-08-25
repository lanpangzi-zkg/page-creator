import React from 'react';
import { Button, Drawer, Table, Popconfirm } from 'antd';
import ApiModal from './ApiModal';
import './index.css';

class ApiManage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            editApi: null,
            pageApiQueue: [],
            apiModalVisible: false,
        };
        this.columns = [{
            title: 'host',
            dataIndex: 'host',
        }, {
            title: 'method',
            dataIndex: 'method',
        }, {
            title: 'url',
            dataIndex: 'url',
        }, {
            title: '入参',
            dataIndex: 'paramsMap',
        }, {
            title: 'modelKey',
            dataIndex: 'modelKey',
        }, {
            title: 'isPagination',
            dataIndex: 'isPagination',
            render(text) {
                return (<span>{`${text}`}</span>);
            }
        }, {
            title: '操作',
            width: 80,
            render: (_, record) => {
                return (
                    <>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                this.setState({
                                    editApi: record,
                                    apiModalVisible: true,
                                });
                            }}
                        >
                            编辑
                        </Button>
                        <Popconfirm
                            title="确定删除?"
                            onConfirm={() => {
                                const pageApiQueue = this.state.pageApiQueue.filter((item) => {                                    
                                    return item.uid !== record.uid;
                                });
                                this.setState({
                                    pageApiQueue,
                                });
                            }}
                            okText="是"
                            cancelText="否"
                        >
                            <Button
                                size="small"
                                type="link"
                            >
                                删除
                            </Button>
                        </Popconfirm>
                    </>
                );
            }
        }];
        this.onToggleApiModalVisible = this.onToggleApiModalVisible.bind(this);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.visible !== this.props.visible || !prevProps.visible) {
            this.setState({
                pageApiQueue: this.props.pageApiQueue,
            });
        }
    }
    onToggleApiModalVisible(_, apiData) {
        this.setState({
            editApi: null,
            apiModalVisible: !this.state.apiModalVisible,
        });
        if (apiData) {
            const { pageApiQueue } = this.state;
            const index = pageApiQueue.findIndex((item) => {
                return item.uid === apiData.uid;
            });
            if (index >= 0) {
                pageApiQueue[index] = apiData;
            } else {
                apiData.uid = Date.now();
                pageApiQueue.push(apiData);
            }
            this.setState({
                pageApiQueue: pageApiQueue.slice(),
            });
        }
    }
    onClose = (e) => {
        const { onClose } = this.props;
        const { pageApiQueue } = this.state;
        onClose(e, pageApiQueue);
    }
    render() {
        const { visible, pageConfig } = this.props;
        const { apiModalVisible, pageApiQueue, editApi } = this.state;
        return (
            <>
                <Drawer
                    width={800}
                    title="API管理"
                    visible={visible}
                    maskClosable={false}
                    onClose={this.onClose}
                    className="api-manage-wrapper"
                >
                    <Button
                        ghost
                        size="small"
                        type="primary"
                        icon="plus"
                        onClick={this.onToggleApiModalVisible}
                        style={{
                            marginBottom: 10
                        }}
                    >
                        新增
                    </Button>
                    <Table
                        bordered
                        rowKey="uid"
                        columns={this.columns}
                        dataSource={pageApiQueue}
                        pagination={false}
                    />
                </Drawer>
                <ApiModal
                    editApi={editApi}
                    pageConfig={pageConfig}
                    visible={apiModalVisible}
                    onClose={this.onToggleApiModalVisible}
                />
            </>
        );
    }
}

export default ApiManage;
