import React from 'react';
import { Layout, Modal } from 'antd';
import Dropable from '../../Core/Dropable';
import DragMenuBox from '../../DragMenuBox';
import AppContext from '../../../shared/AppContext';
import PropsEditor from '../PropsEditor';
import { DELETE } from "../../../shared/Tag";
import { renderStage } from '../../Renderer/helper/RenderHelper';
import updateRootConfigs, { showPropsEditor, hidePropsEditor } from '../helper';

const { Sider, Content } = Layout;
const dropTargetClassName = 'modal-stage-container';

const defaultRootConfigs = {
    uid: -1,
    name: 'root',
    children: [],
};

class ModalStageContainer extends Dropable {
    constructor(props) {
        super(props);
        this.state = {
            editSchema: null,
            showPropsEditor: false,
            rootConfigs: defaultRootConfigs,
        };
        this.uid = 0;
        this.bindEventContext();
        this.dropContainer = React.createRef();
        this.dropTargetClassName = dropTargetClassName;
        this.onOk = this.onOk.bind(this);
        this.onDeleteConfig = this.onDeleteConfig.bind(this);
        this.onShowPropsEditor = this.onShowPropsEditor.bind(this);
        this.onHidePropsEditor = this.onHidePropsEditor.bind(this);
        this.onUpdateRootConfigs = this.onUpdateRootConfigs.bind(this);
    }
    componentWillUnmount() {
        this.removeEvent();
    }
    componentDidUpdate(prevProps) {
        const { visible, editModal } = this.props;
        if (editModal && prevProps.visible !== visible && visible) {
            this.setState({
                rootConfigs: editModal.rootConfigs || defaultRootConfigs,
            });
        }
        if (visible && !this.isAddEvent) {
            setTimeout(() => {
                this.addEvent();
            });
        }
    }
    onUpdateRootConfigs(childConfig, effectTag) {
        updateRootConfigs(this, childConfig, effectTag);
    }
    onDeleteConfig(config) {
        this.onUpdateRootConfigs(config, DELETE);
    }
    onShowPropsEditor(editSchema) {
        showPropsEditor(this, editSchema);
    }
    onHidePropsEditor(_, newConfigs) {
        hidePropsEditor(this, _, newConfigs);
    }
    onOk(e) {
        const { rootConfigs } = this.state;
        const { onClose, editModal } = this.props;
        rootConfigs.wrapModal = editModal;
        rootConfigs.children.forEach((child) => {
            child.return.wrapModal = editModal;
        });
        onClose(e, Object.assign(editModal, { rootConfigs }));
        this.setState({
            rootConfigs: defaultRootConfigs,
        });
    }
    render() {
        const { visible, onClose, preview } = this.props;
        const {
            editSchema,
            pageApiQueue,
            pageModalQueue,
            showPropsEditor,
        } = this.state;
        return (
            <Modal
                centered
                width={1280}
                footer={null}
                title="modal布局"
                visible={visible}
                onOk={this.onOk}
                onCancel={this.onOk}
                maskClosable={false}
                wrapClassName="modal-stage-wrapper"
            >
                <Layout>
                    <Sider width="300">
                        <DragMenuBox />
                    </Sider>
                    <Layout>
                        <Content>
                            <div
                                ref={this.dropContainer}
                                className={`main-container ${dropTargetClassName}`}
                            >
                                <AppContext.Provider
                                    value={{
                                        preview,
                                        global: this,
                                        onDeleteConfig: this.onDeleteConfig,
                                        onShowPropsEditor: this.onShowPropsEditor,
                                        onUpdateRootConfigs: this.onUpdateRootConfigs,
                                    }}
                                >
                                    {renderStage(this.state.rootConfigs, false)}
                                </AppContext.Provider>
                            </div>
                            <PropsEditor
                                editSchema={editSchema}
                                visible={showPropsEditor}
                                pageApiQueue={pageApiQueue}
                                pageModalQueue={pageModalQueue}
                                onClose={this.onHidePropsEditor}
                            />
                        </Content>
                    </Layout>
                </Layout>
            </Modal>
        );
    }
}

export default ModalStageContainer;
