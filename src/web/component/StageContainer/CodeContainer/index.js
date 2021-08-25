import React from 'react';
import ClipboardJS from 'clipboard';
import { Tree, Layout, Button, message } from 'antd';
import createCode from './CodeCreator';
import './index.css';

const { TreeNode, DirectoryTree } = Tree;
const { Sider, Content } = Layout;

class CodeContainer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            activeFileKey: '',
        };
        this.codeCache = {};
    }
    componentDidMount() {
        this.copyBtn = new ClipboardJS('.btn-copy-code');
        this.copyBtn.on('success', function (e) {
            e.clearSelection();
           message.success('复制成功');
        });
        this.copyBtn.on('error', function (e) {
            message.error('复制失败');
        });
    }
    componentWillUnmount() {
        this.copyBtn && this.copyBtn.destroy();
    }
    onSelect = ([activeFileKey], { node }) => {
        if (node.isLeaf()) {
            this.setState({
                activeFileKey,
            });
        }
    }
    onRefresh = () => {
        const { activeFileKey } = this.state;
        if (activeFileKey) {
            const { rootConfigs, pageConfig, pageApiQueue, pageModalQueue } = this.props;
            this.codeCache[activeFileKey] = createCode(rootConfigs, pageConfig, pageApiQueue, pageModalQueue, activeFileKey);
            document.querySelector('.code-wrap').innerHTML = this.codeCache[activeFileKey];
        }
    }
    onCopyCode = () => {
        message.success('复制成功');
    }
    renderFileCode() {
        const { activeFileKey } = this.state;
        const { rootConfigs, pageConfig, pageApiQueue, pageModalQueue } = this.props;
        if (!activeFileKey) {
            return null;
        }
        if (!this.codeCache[activeFileKey]) {
            this.codeCache[activeFileKey] = createCode(rootConfigs, pageConfig, pageApiQueue, pageModalQueue, activeFileKey);
        }
        return (<>{this.codeCache[activeFileKey]}</>);
    }
    render() {
        const { pageConfig, pageModalQueue } = this.props;
        const { pageName = 'Anonymous' } = pageConfig || {};
        return (
            <div className="code-container">
                <Layout>
                    <Sider width="200" theme="light">
                        <DirectoryTree
                            defaultExpandAll
                            onSelect={this.onSelect}
                        >
                            <TreeNode title="pages">
                                <TreeNode title={pageName}>
                                    <TreeNode
                                        title="index.js"
                                        key="index"
                                        isLeaf
                                    />
                                    {
                                        pageModalQueue.map(({ name, uid }) => {
                                            return (
                                                <TreeNode
                                                    isLeaf
                                                    key={uid}
                                                    title={`${name}.js`}
                                                />
                                            );
                                        })
                                    }
                                </TreeNode>
                            </TreeNode>
                            <TreeNode title="models">
                                <TreeNode title={`${pageName}.js`} key="model" isLeaf />
                            </TreeNode>
                            <TreeNode title="services">
                                <TreeNode title={`${pageName}.js`} key="service" isLeaf />
                            </TreeNode>
                        </DirectoryTree>
                    </Sider>
                    <Content>
                        <div className="top-bar">
                            {/* <Button
                                size="small"
                                icon="sync"
                                onClick={this.onRefresh}
                            >
                                刷新
                            </Button> */}
                            <Button
                                size="small"
                                icon="copy"
                                type="danger"
                                className="btn-copy-code"
                                data-clipboard-target=".code-wrap"
                            >
                                复制
                            </Button>
                        </div>
                        <pre className="code-wrap">
                            {this.renderFileCode()}
                        </pre>
                    </Content>
                </Layout>
            </div>
        );
    }
}

export default CodeContainer;