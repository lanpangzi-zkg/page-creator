import React from 'react';
import { Modal, Spin } from 'antd';
import { executeRequestApi } from '../../StageContainer/helper';
import  { renderPageComponent } from '../../Renderer/helper/RenderHelper';
class ModalRender extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            apiData: {},
            pageSize: 10,
            pageIndex: 1,
            fetchLoading: false,
        };
    }
    renderContent(rootConfigs) {
        if (Array.isArray(rootConfigs?.children)) {
            return rootConfigs.children.map((child) => renderPageComponent(child, true));
        }
        return null;
    }
    getCurrentMode() {
        const { modalProps, activeModal } = this.props;
        const { supportMode = [] } = activeModal;
        if (modalProps?.mode && supportMode.includes(modalProps.mode)) {
            return modalProps.mode;
        }
        if (supportMode.includes('add') && activeModal?.addRequestApi) {
            return 'add';
        }
    }
    componentDidUpdate(prevProps) {
        if (!prevProps.activeModal && this.props.activeModal) {
            const { activeModal, modalProps } = this.props;
            const { initRequestApi, editRequestApi } = activeModal;
            const currentMode = this.getCurrentMode();
            if (currentMode === 'edit' || currentMode === 'view') {
                const { editRecord } = modalProps;
                if (initRequestApi) {
                    // 初始化查询默认传递待编辑对象
                    executeRequestApi(this, initRequestApi, editRecord).then((res) => {
                        this.initFormValues(this.getFormRefByApiId(initRequestApi), res.data?.data);
                    });
                } else {
                    // 利用editRecord初始化界面
                    setTimeout(() => {
                        this.initFormValues(this.getFormRefByApiId(editRequestApi), editRecord);
                    });
                }
            }
        }
    }
    initFormValues(formRef, values) {
        if (formRef && values) {
            formRef.setFieldsValue(values);
        }
    }
    getFormRefByApiId(apiId) {
        return this.props.apiFormMap[apiId];
    }
    onCancel = (callbackApi) => {
        this.props.onCancel(callbackApi);
    }
    onOk = () => {
        const { activeModal, modalProps } = this.props;
        const { addRequestApi, editRequestApi, onOkCallBackRequestApi } = activeModal;
        const currentMode = this.getCurrentMode();
        if (currentMode === 'view') {
            this.onCancel();
            return;
        }
        const requestApiId = currentMode === 'add' ? addRequestApi : editRequestApi;
        const formRef = this.getFormRefByApiId(requestApiId);
        if (formRef && requestApiId) {
            const { editRecord = {} } = modalProps;
            formRef.validateFields((err, fieldsValue) => {
                if (err) {
                    return;
                }
                executeRequestApi(this, requestApiId, Object.assign(editRecord, fieldsValue)).then(() => {
                    this.onCancel(onOkCallBackRequestApi);
                });
            });
            return;
        }
        this.onCancel(onOkCallBackRequestApi);
    }
    render() {
        const { fetchLoading } = this.state;
        const { activeModal } = this.props;
        if (activeModal) {
            const {
                width,
                rootConfigs,
                supportMode,
                addRequestApi,
                editRequestApi,
                initRequestApi,
                ...rawProps } = activeModal;
            if (width) {
                rawProps.width = parseFloat(width);
            }
            return (
                <Modal
                    visible
                    {...rawProps}
                    onOk={this.onOk}
                    onCancel={this.onCancel}
                >
                    <Spin spinning={fetchLoading}>
                        {this.renderContent(rootConfigs)}
                    </Spin>
                </Modal>
            );
        }
        return null;
    }
}

export default ModalRender;
