import React, { PureComponent } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import './index.css';

const proxyServerUrl = 'http://127.0.0.1:9123';

class LoginModal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showLoginFrame: false,
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onResetModal = this.onResetModal.bind(this);
        this.getIframeUrl = this.getIframeUrl.bind(this);
        this.asyncAppendJs = this.asyncAppendJs.bind(this);
    }
    onSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.asyncAppendJs(values.appUrl);
            }
        });
    }
    componentDidMount() {
        window.addEventListener('message', (e) => {
            if (e.origin === proxyServerUrl) {
                const appUrl =  this.props.form.getFieldValue('appUrl');
                let MerchantId = '';
                if (appUrl && appUrl.indexOf('?') > 0 && appUrl.indexOf('MerchantId=') > 0) {
                    const targetStr = appUrl.slice(appUrl.indexOf('?') + 1).split('&').find((searchStr) => {
                        return searchStr.indexOf('MerchantId=') >= 0;
                    })
                    if (targetStr) {
                        MerchantId = targetStr.split('=')[1];
                    }
                    localStorage.setItem('access_token', e.data);
                    localStorage.setItem('MerchantId', MerchantId);
                    localStorage.setItem('appUrl', appUrl);
                    message.success('登录成功');
                    this.props.onCloseLoginModal();
                }
            }
        }, false);
    }
    clearStorage() {
        ['access_token', 'MerchantId', 'appUrl', 'common', 'main', 'webapi'].forEach((k) => {
            localStorage.removeItem(k);
        });
    }
    componentDidUpdate() {
        if (this.props.visible && !this.clearInit) {
            this.clearInit = true;
            this.clearStorage();
        }
    }

    asyncAppendJs(appUrl) {
        const js = document.createElement('script');
        js.type = 'text/javascript';
        js.onload = (e) => {
            console.log(e);
            // 配置文件加载成功
            if (window.configs) {
                localStorage.setItem('common', window.configs.host.common);
                localStorage.setItem('main', window.configs.host.main);
                localStorage.setItem('webapi', window.configs.host.webapi);
                localStorage.setItem('authCode', window.configs.host.passport.authCode);
                this.setState({
                    showLoginFrame: true,
                }, () => {
                    this.sendMessageToIframe();
                });
            }
        };
        let jsHost = appUrl;
        if (appUrl.indexOf('?')) {
            jsHost = appUrl.slice(0, appUrl.indexOf('?') - 1);
        }
        js.src = `${jsHost}/resources/js/configs.js?time=${Date.now()}`;
        document.body.appendChild(js);
    }

    sendMessageToIframe() {
        const iframeLogin = document.createElement('iframe');
        iframeLogin.src = this.getIframeUrl();
        iframeLogin.id = 'login-app';
        document.querySelector('.iframe-container').appendChild(iframeLogin);
        iframeLogin.onload = () => {
            const data = Object.assign({ appUrl: this.props.form.getFieldValue('appUrl') }, window.configs);
            document.getElementById('login-app').contentWindow.postMessage(data, proxyServerUrl);
        };
    }

    onResetModal() {
        this.props.form.resetFields();
        this.clearInit = false;
        this.setState({
            showLoginFrame: false,
        });
    }

    getIframeUrl() {
        if (window.configs) {
            const { host: { passport: { auth } } } = window.configs;
            return `${proxyServerUrl}/appLogin?authUrl=${encodeURIComponent(auth)}`;
        }
        return `${proxyServerUrl}/appLogin`;
    }

    render() {
        const { visible, form, onCloseLoginModal } = this.props;
        const { getFieldDecorator } = form;
        const { showLoginFrame } = this.state;
        return (
            <Modal
                title="登录"
                visible={visible}
                width="500px"
                wrapClassName="login-modal"
                onCancel={onCloseLoginModal}
                afterClose={this.onResetModal}
                maskClosable={false}
                footer={null}
            >
                <div className={`login-wrapper ${showLoginFrame ? 'slide-l' : ''}`}>
                    <div className="url-container">
                        <Form onSubmit={this.onSubmit}>
                            <Form.Item label="应用url">
                                {getFieldDecorator('appUrl', {
                                    rules: [
                                        { required: true, message: '请输入应用url' },
                                        { type: 'url', message: 'url格式不合法' }
                                    ],
                                })(<Input placeholder="url加上MerchantId参数" />)}
                            </Form.Item>
                            <p className="btn-box">
                                <Button type="primary" htmlType="submit">确定</Button>
                            </p>
                        </Form>
                    </div>
                    <div className="iframe-container">
                    </div>
                </div>
            </Modal>
        );
    }
}

export default Form.create()(LoginModal);