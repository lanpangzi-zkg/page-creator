/**
 * @desc 负责渲染拖拽到主舞台的组件
 */
import { message, Spin } from "antd";
import React, { Fragment } from "react";
import HeaderBar from "./HeaderBar";
import ApiManage from './ApiManage';
import { Service } from "./annotation";
import ModalManage from './ModalManage';
import Dropable from '../Core/Dropable';
import PropsEditor from './PropsEditor';
import { DELETE } from "../../shared/Tag";
import ConfigManage from './ConfigManage';
import CodeContainer from './CodeContainer';
import AppContext from '../../shared/AppContext';
import ModalRender from "../Renderer/ModalRender";
import PreviewContainer from "./PreviewContainer";
import { renderStage, parseStyle } from '../Renderer/helper/RenderHelper';
import updateRootConfigs, { showPropsEditor, hidePropsEditor, executeRequestApi } from './helper';
import "./index.css";

@Service("AppService")
class StageContainer extends Dropable {
    constructor(props) {
        super(props);
        this.state = {
            pageIndex: 1,
            pageSize: 10,
            apiData: {}, // 保存接口响应的数据
            activeModal: null,
            editSchema: null,
            selectedRows: [],
            selectedRowKeys: [],
            fetchLoading: false,
            showPropsEditor: false,
            generateLoading: false,
            rootConfigs: { // 根配置对象
                uid: -1,
                name: 'root',
                children: [],
            },
            modalProps: null,
            pageConfig: null, // 页面配置信息，包括应用域名、页面名称、项目根目录
            pageApiQueue: [], // 页面api列表
            pageModalQueue: [], // 页面弹窗
            apiManageVisible: false,
            modalManageVisible: false,
            configManageVisible: false,
        };
        this.uid = 0;
        this.apiFormMap = {};
        this.bindEventContext();
        this.dropContainer = React.createRef();
        this.dropTargetClassName = "main-container";
    }
    onToggleConfigManageVisible = (_, pageConfig) => {
        this.setState({
            configManageVisible: !this.state.configManageVisible,
        });
        if (pageConfig) {
            this.setState({
                pageConfig,
            });
        }
    }
    onToggleApiManageVisible = (_, pageApiQueue) => {
        this.setState({
            apiManageVisible: !this.state.apiManageVisible,
        });
        if (pageApiQueue) {
            this.setState({
                pageApiQueue,
            });
        }
    }
    onToggleModalManageVisible = (_, pageModalQueue) => {
        this.setState({
            modalManageVisible: !this.state.modalManageVisible,
        });
        if (pageModalQueue) {
            this.setState({
                pageModalQueue,
            });
        }
    }
    /**
     * @desc 更新页面配置对象
     */
    onUpdateRootConfigs = (childConfig, effectTag) => {
        updateRootConfigs(this, childConfig, effectTag);
    }
    onDeleteConfig = (config) => {
        this.onUpdateRootConfigs(config, DELETE);
    }
    componentDidMount() {
        this.addEvent();
    }
    componentWillUnmount() {
        this.removeEvent();
    }
    /**
     * @desc 方便子组件通过context调用
     */
    executeRequestApi(apiId, params) {
        executeRequestApi(this, apiId, params);
    }
    /**
     * @desc 建立表单对象form和接口之间的关系
     * @param {*} form 
     * @param {*} apiId 
     */
    linkApiAndForm = (apiId, form) => {
        this.apiFormMap[apiId] = form;
    }
    getApiById(id) {
        return this.state.pageApiQueue.find(({ uid }) => {
            return uid === id;
        });
    }
    onPageChange = (pageIndex, pageSize, apiId) => {
        this.setState({
            pageIndex,
            pageSize,
        }, () => {
            this.executeRequestApi(apiId);
        });
    }
    onShowSizeChange = (pageIndex, pageSize, apiId) => {
        this.setState({
            pageIndex,
            pageSize,
        }, () => {
            this.executeRequestApi(apiId);
        });
    }
    /**
     * @desc 生成页面源代码
     */
    onGeneratePage = () => {
        const { pageConfig } = this.state;
        const { pageName, projectDir } = pageConfig;
        if (!pageName || !projectDir) {
            this.onToggleConfigManageVisible(); // 设置页面名称
            return;
        }
        if (!window.ipcRenderer) {
            message.error("请使用桌面版应用打开");
            return;
        }
        const { rootConfigs, pageApiQueue } = this.state;
        if (rootConfigs.length === 0) {
            message.warn("请配置页面信息");
            return;
        }
        this.setState({
            generateLoading: true,
        });
        window.ipcRenderer.send("createCode", JSON.stringify({
            pageName,
            projectDir,
            rootConfigs,
            pageApiQueue,
        }));
        window.ipcRenderer.on("createCodeReply", (_, args) => {
            const { code, info } = JSON.parse(args);
            if (code === 0) {
                message.success(info);
            } else {
                message.error(info);
            }
            this.setState({
                generateLoading: false,
            });
        });
    }
    onShowModal = (modalName, modalProps = {}) => {
        const { pageModalQueue } = this.state;
        const activeModal = pageModalQueue.find((item) => {
            return item.name === modalName;
        });
        this.setState({
            activeModal,
            modalProps,
        });
    }
    onCancelModal = (onOkCallBackRequestApi) => {
        this.setState({
            activeModal: null,
        });
        if (onOkCallBackRequestApi) { // 弹窗【确定】关闭只会还要执行接口，通常用于重置页面查询
            const targetApi = this.getApiById(onOkCallBackRequestApi);
            if (targetApi) {
                const { isPagination, paginationParamsMap } = targetApi;
                if (isPagination) { // 如果接口有分页，那么需要重置当前页数为1然后执行查询
                    const [pageIndexName, _] = paginationParamsMap.split(',').map((str) => str.trim());
                    this.setState({
                        [pageIndexName]: 1,
                    }, () => this.executeRequestApi(onOkCallBackRequestApi));
                } else {
                    this.executeRequestApi(onOkCallBackRequestApi);
                }
            }
        }
    }
    onShowPropsEditor = (editSchema) => {
        showPropsEditor(this, editSchema);
    }
    onHidePropsEditor = (_, newConfigs) => {
        hidePropsEditor(this, _, newConfigs);
    }
    render() {
        const { activeStageMode, service } = this.props;
        const {
            modalProps,
            pageConfig,
            editSchema,
            activeModal,
            rootConfigs,
            fetchLoading,
            pageApiQueue,
            pageModalQueue,
            showPropsEditor,
            apiManageVisible,
            modalManageVisible,
            configManageVisible,
        } = this.state;
        return (
            <Fragment>
                <Spin
                    spinning={fetchLoading}
                    wrapperClassName="main-spin"
                >
                    <div
                        ref={this.dropContainer}
                        className="main-container"
                        style={parseStyle(pageConfig?.style) || {}}
                    >
                        <AppContext.Provider
                            value={{
                                global: this,
                                onDeleteConfig: this.onDeleteConfig,
                                onShowPropsEditor: this.onShowPropsEditor,
                                onUpdateRootConfigs: this.onUpdateRootConfigs,
                            }}
                        >
                            {renderStage(rootConfigs, false)}
                            {activeStageMode === 'preview' &&
                                <PreviewContainer
                                    service={service}
                                    pageConfig={pageConfig}
                                    rootConfigs={rootConfigs}
                                    apiFormMap={this.apiFormMap}
                                    pageApiQueue={pageApiQueue}
                                    pageModalQueue={pageModalQueue}
                                />
                            }
                            {activeStageMode === 'code' &&
                                <CodeContainer
                                    pageConfig={pageConfig}
                                    rootConfigs={rootConfigs}
                                    pageApiQueue={pageApiQueue}
                                    pageModalQueue={pageModalQueue}
                                />
                            }
                            <ModalRender
                                preview
                                service={service}
                                modalProps={modalProps}
                                activeModal={activeModal}
                                apiFormMap={this.apiFormMap}
                                onCancel={this.onCancelModal}
                                pageApiQueue={pageApiQueue}
                            />
                        </AppContext.Provider>
                    </div>
                </Spin>
                <HeaderBar
                    onGeneratePage={this.onGeneratePage}
                    onOpenApiManage={this.onToggleApiManageVisible}
                    onOpenModalManage={this.onToggleModalManageVisible}
                    onOpenConfigManage={this.onToggleConfigManageVisible}
                />
                <PropsEditor
                    editSchema={editSchema}
                    visible={showPropsEditor}
                    pageApiQueue={pageApiQueue}
                    pageModalQueue={pageModalQueue}
                    onClose={this.onHidePropsEditor}
                />
                <ApiManage
                    pageConfig={pageConfig}
                    visible={apiManageVisible}
                    pageApiQueue={pageApiQueue}
                    onClose={this.onToggleApiManageVisible}
                />
                <ModalManage
                    pageApiQueue={pageApiQueue}
                    visible={modalManageVisible}
                    pageModalQueue={pageModalQueue}
                    onClose={this.onToggleModalManageVisible}
                />
                <ConfigManage
                    pageConfig={pageConfig}
                    visible={configManageVisible}
                    onClose={this.onToggleConfigManageVisible}
                />
            </Fragment>
        );
    }
}

export default StageContainer;
