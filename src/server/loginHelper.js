const url = require('url');
const path = require('path');
const fs = require('fs-extra');
const http = require('http');
const https = require('https');
const certificate = fs.readFileSync(path.resolve(__dirname, 'configs', 'suuyuu_cn.crt'));

function getProxyHeaders(reqUrl, method, acceptType, cookie, requestData) {
    const urlObj = url.parse(reqUrl);
    const proxyHeaders = {
        'Origin': urlObj.protocol + '//' + urlObj.host,
        'Referer': urlObj.protocol+ '//' + urlObj.host +'/user/login',
        'Host': urlObj.hostname,
        'Accept': acceptType === 'json' ? 'application/json, text/plain, */*; q=0.01' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Forwarded-For': '127.0.0.1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    };
    if (requestData && method !== 'GET') {
        proxyHeaders['Content-Length'] = Buffer.byteLength(JSON.stringify(requestData));
        proxyHeaders['Content-Type'] = 'application/json;charset=UTF-8';
    }
    if (cookie) {
        proxyHeaders['Cookie'] = cookie;
    }
    return proxyHeaders;
}

function getRquestOptions(reqUrl, path, method = 'POST', acceptType = 'json', cookie = '', requestData = '') {
    if (!reqUrl) {
        return null;
    }
    const urlObj = url.parse(reqUrl);
    const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 80,
        path: method === 'GET' ? `${path}?${(new url.URLSearchParams(requestData)).toString()}` : path,
        method: method,
        headers: getProxyHeaders(reqUrl, method, acceptType, cookie, requestData),
        timeout: 5000,
    };
    if (urlObj.protocol === 'https:' && path !== '/user/login') {
        options.cert = certificate;
        options.port = 443;
    }
    return options;
}

function getFetchApiOption(ctx) {
    const { host, appUrl, method = 'POST', api, params, access_token, MerchantId } = ctx.body;
    const appUrlObj = url.parse(appUrl);
    const options = getRquestOptions(host, api, method, 'json', ctx.headers.cookie, params);
    options.headers['Authorization'] = `Bearer ${access_token}`;
    options.headers['MerchantId'] = MerchantId;
    options.headers['Origin'] = appUrlObj.protocol + '//' + appUrlObj.host;
    options.headers['Referer'] = appUrl;
    delete options.headers['X-Requested-With'];
    delete options.headers['Accept-Encoding']; // 接口调用不能启用压缩
    if(method !== 'POST') {
      delete options.headers['Content-Length'];
      delete options.headers['Content-Type'];
    }
    return options;
}

async function porxyRequest(ctx, options, params) {
    const { method = 'POST' } = ctx.body;
    const httpObj = options.cert ? https : http; // 判断协议
    const result = await new Promise((resolve, reject) => {
        const req = httpObj.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                resolve({ headers: res.headers, body: responseData, statusCode: res.statusCode });
            });
        });
        if (method !== 'GET') {
            req.write(JSON.stringify(params));
        }
        req.end();
    });
    return result;
}

module.exports = {
    getRquestOptions,
    getFetchApiOption,
    porxyRequest,
};