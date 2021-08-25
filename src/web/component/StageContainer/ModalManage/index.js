import React from 'react';
import { Button, Drawer, Table, Popconfirm } from 'antd';
import MModal from './MModal';
import ModalStageContainer from './ModalStageContainer';
import './index.css';

class ModalManage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            editModal: null,
            pageModalQueue: [],
            mModalVisible: false,
            modalStageContainerVisible: false,
        };
        this.columns = [{
            title: 'name',
            dataIndex: 'name',
        }, {
            title: 'title',
            dataIndex: 'title',
        }, {
            title: 'width',
            dataIndex: 'width',
        }, {
            title: 'wrapClassName',
            dataIndex: 'wrapClassName',
        }, {
            title: 'maskClosable',
            dataIndex: 'maskClosable',
            render(text) {
                return (<span>{`${text}`}</span>);
            }
        }, {
            title: '操作',
            width: 120,
            render: (_, record) => {
                return (
                    <>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                this.setState({
                                    editModal: record,
                                    mModalVisible: true,
                                });
                            }}
                        >
                            编辑
                        </Button>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                this.setState({
                                    editModal: record,
                                    modalStageContainerVisible: true,
                                });
                            }}
                        >
                            布局
                        </Button>
                        <Popconfirm
                            title="确定删除?"
                            onConfirm={() => {
                                const pageModalQueue = this.state.pageModalQueue.filter((item) => {                                    
                                    return item.uid !== record.uid;
                                });
                                this.setState({
                                    pageModalQueue,
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
    }
    componentDidUpdate(prevProps) {
        if (prevProps.visible !== this.props.visible || !prevProps.visible) {
            this.setState({
                pageModalQueue: this.props.pageModalQueue,
            });
        }
    }
    onToggleMModalVisible = (_, modalData) => {
        this.setState({
            editModal: null,
            mModalVisible: !this.state.mModalVisible,
        });
        if (modalData) {
            const { pageModalQueue } = this.state;
            const index = pageModalQueue.findIndex((item) => {
                return item.uid === modalData.uid;
            });
            if (index >= 0) {
                pageModalQueue[index] = modalData;
            } else {
                modalData.uid = Date.now();
                pageModalQueue.push(modalData);
            }
            this.setState({
                pageModalQueue: pageModalQueue.slice(),
            });
        }
    }
    onToggleModalStageContainerVisible = (_, editModal) => {
        this.setState({
            editModal: null,
            modalStageContainerVisible: !this.state.modalStageContainerVisible,
        });
        if (editModal) {
            const { pageModalQueue } = this.state;
            const index = pageModalQueue.findIndex((item) => {
                return item.uid === editModal.uid;
            });
            if (index >= 0) {
                pageModalQueue[index] = editModal;
                this.setState({
                    pageModalQueue: pageModalQueue.slice(),
                });
            }
        }
    }
    onClose = (e) => {
        const { onClose } = this.props;
        const { pageModalQueue } = this.state;
        onClose(e, pageModalQueue);
    }
    render() {
        const { visible, pageApiQueue } = this.props;
        const { mModalVisible, pageModalQueue, editModal, modalStageContainerVisible } = this.state;
        return (
            <>
                <Drawer
                    width={800}
                    title="Modal管理"
                    visible={visible}
                    maskClosable={false}
                    onClose={this.onClose}
                    className="modal-manage-wrapper"
                >
                    <Button
                        ghost
                        size="small"
                        type="primary"
                        icon="plus"
                        onClick={this.onToggleMModalVisible}
                        style={{
                            marginBottom: 10
                        }}
                    >
                        新增
                    </Button>
                    <Table
                        bordered
                        rowKey="uid"
                        pagination={false}
                        columns={this.columns}
                        dataSource={pageModalQueue}
                    />
                </Drawer>
                <MModal
                    editModal={editModal}
                    visible={mModalVisible}
                    pageApiQueue={pageApiQueue}
                    onClose={this.onToggleMModalVisible}
                />
                <ModalStageContainer
                    editModal={editModal}
                    visible={modalStageContainerVisible}
                    onClose={this.onToggleModalStageContainerVisible}
                />
            </>
        );
    }
}

export default ModalManage;
