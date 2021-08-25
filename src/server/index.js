const Koa = require('koa');
const url = require('url');
const path = require('path');
const fs = require('fs-extra');
const Router = require('koa-router');
const static = require('koa-static');
const querystring = require('querystring');
const bodyparser = require('koa-bodyparser');
const { porxyRequest, getRquestOptions, getFetchApiOption } = require('./loginHelper');
// const createLogin = require('./nodeScript/createLogin');
// const createCode = require('./nodeScript/createCode');

const app = new Koa();
const router = new Router();
const staticPath = path.join('../', '../', 'dist');
// 下载代码文件
// router.get('/sourceCache/:filename', async (ctx) => {
// 	const filename = ctx.params.filename;
// 	ctx.set('Content-Type', 'text/plain;charset=utf-8');
// 	ctx.set('Content-Disposition', `attachment;filename=${filename}`);
// 	const tarFilePath = path.resolve(__dirname, `sourceCache/${filename}`);
// 	const file = await fs.readFileSync(tarFilePath);
// 	ctx.body = file;
// 	fs.remove(tarFilePath);
// 	const [ sourceCacheDir ] = filename.split('.');
// 	fs.remove(path.resolve(__dirname, `sourceCache/${sourceCacheDir}`));
// });

app.use(bodyparser());

app.use(static(
  	path.join( __dirname, staticPath)
));

// 返回登录页面
// router.get('/appLogin', async (ctx, next) => {
// 	await next();
// 	ctx.set('Content-Type', 'text/html; charset=utf-8');
// 	const loginHtml = await createLogin(ctx.query);
// 	ctx.body = loginHtml;
// });

// 登录
router.post('/user/login2', async (ctx, next) => {
	await next();
	try {
		const { authUrl, Password, UserName, RememberMe } = ctx.body;
		const params = { Password, UserName, RememberMe };
		const options = getRquestOptions(authUrl, '/user/login2', 'POST', 'json', '', params);
		if (!options) {
			ctx.body = 'url参数不正确';
		}
		const result = await porxyRequest(ctx, options, params);
		const { code } = JSON.parse(result.body);
		// 登录失败
		if (code != '0') {
			// ctx.body = result.body;
			ctx.body = '登录失败' + JSON.stringify(options);
		} else {
			const setCookie = result.headers['set-cookie'];
			if (Array.isArray(setCookie)) {
				result.headers['set-cookie'] = setCookie.reduce((arr, cookieStr) => {
					arr.push(cookieStr.replace(/\s?secure;/, ''));
					return arr;
				}, []);
			}
			Object.keys(result.headers).forEach((k) => {
				ctx.set(k, result.headers[k]);
			});
			ctx.body = result.body;
		}
	} catch(e) {
		ctx.body = '异常：' + JSON.stringify(e);
	}
});

// 登录成功之后授权
router.post('/app/auth', async (ctx, next) => {
	await next();
	const { appUrl, authUrl, clientId, tokenUrl } = ctx.body;
	const params = {
		client_id: clientId,
		redirect_uri: appUrl,
		response_type: 'code',
		scope: 'get_user_info',
		state: 'xyz',
	};
	const options = getRquestOptions(authUrl, '/oauth/authorize', 'GET', 'html', ctx.headers.cookie, params);
	const result = await porxyRequest(ctx, options, params);
	const { headers, body, statusCode } = result || {};
	if (headers && headers.location) {
		const { query } = url.parse(headers.location);
		const { code, state } = querystring.parse(query);
		// 获取token
		const tokenParams = {
			code,
			state,
			redirect_uri: appUrl,
		};
		const tokenOptions = getRquestOptions(tokenUrl, '/api/authorization_code', 'POST', 'json', '', tokenParams);
		delete tokenOptions.headers['Accept-Encoding'];
		const tokenResult = await porxyRequest(ctx, tokenOptions, tokenParams);
		const tokenBody = tokenResult.body;
		ctx.body = tokenBody;
		ctx.status = tokenResult.statusCode;
	} else {
		ctx.body = body;
		ctx.status = statusCode;
	}
});

// 跨域预检测
router.options('/fetchApi', async (ctx, next) => {
	await next();
	ctx.set('Access-Control-Allow-Origin', '*');
	ctx.set('Access-Control-Allow-Headers', 'Content-Type');
	ctx.body = 'ok';
});

// 调用api
router.post('/fetchApi', async (ctx, next) => {
	await next();
	ctx.set('Access-Control-Allow-Origin', '*');
	ctx.set('Access-Control-Allow-Headers', 'Content-Type');
	ctx.set('Content-Type', 'application/json');
	const options = getFetchApiOption(ctx);
	const { body, statusCode } = await porxyRequest(ctx, options, ctx.body.params);
	ctx.status = statusCode;
	ctx.body = body;
});

// 跨域预检测
// router.options('/generatePage', async (ctx, next) => {
// 	await next();
// 	ctx.set('Access-Control-Allow-Origin', '*');
// 	ctx.set('Access-Control-Allow-Headers', 'Content-Type');
// 	ctx.body = 'ok';
// });

// 生成页面请求
// router.post('/generatePage', async (ctx, next) => {
// 	await next();
// 	const body = ctx.body;
// 	ctx.set('Access-Control-Allow-Origin', '*');
// 	ctx.set('Content-Type', 'application/json');
// 	ctx.set('Access-Control-Allow-Headers', 'Content-Type');
// 	const responseMsg = await createCode(body);
// 	ctx.body = responseMsg;
// });

app
	.use(router.routes())
	.use(router.allowedMethods())
	.use(async (ctx) => {
    	ctx.body =  ctx.request.body;
});

app.listen(process.env.PORT || 9999);