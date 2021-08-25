import React from 'react';
import { Tabs, Layout, ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import DragMenuBox from './component/DragMenuBox';
import StageContainer from './component/StageContainer';

const { TabPane } = Tabs;
const { Header, Sider, Content } = Layout;

class App extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: 'design',
        };
    }
    onTabChange = (activeKey) => {
        this.setState({
            activeKey,
        });
    }
    render() {
        const { activeKey } = this.state;
        return (
            <div className="App">
                <ConfigProvider locale={zhCN}>
                    <Layout>
                        <Header>
                            <span className="app-name">
                                <i className="logo" />
                                PAGE-CREATOR可视化页面搭建平台
                            </span>
                        </Header>
                        <Layout>
                            <Sider width="300">
                                <DragMenuBox />
                            </Sider>
                            <Layout>
                                <Content style={{ position: 'relative' }}>
                                    <Tabs
                                        type="card"
                                        className="top-tabs"
                                        activeKey={activeKey}
                                        onChange={this.onTabChange}
                                    >
                                        <TabPane tab="设计" key="design" />
                                        <TabPane tab="预览" key="preview" />
                                        <TabPane tab="代码" key="code" />
                                    </Tabs>
                                    <StageContainer activeStageMode={activeKey} />
                                </Content>
                            </Layout>
                        </Layout>
                    </Layout>
                </ConfigProvider>
            </div>
        );
    }
}

export default App;
