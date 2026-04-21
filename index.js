const core = require('@actions/core');
const crypto = require('crypto');
const https = require('https');

/**
 * 生成钉钉加签参数
 * @param {string} secret - 加签密钥
 * @returns {{ timestamp: number, sign: string }}
 */
function sign(secret) {
  const timestamp = Date.now();
  const stringToSign = `${timestamp}\n${secret}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(stringToSign);
  const sign = encodeURIComponent(hmac.digest('base64'));
  return { timestamp, sign };
}

/**
 * 发送 HTTPS POST 请求
 * @param {string} url - 完整 URL
 * @param {object} body - 请求体
 * @returns {Promise<object>}
 */
function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let chunks = '';
      res.on('data', (chunk) => (chunks += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(chunks));
        } catch {
          resolve({ raw: chunks });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  try {
    // 1. 读取输入参数
    const dingToken = core.getInput('dingToken', { required: true });
    const secret = core.getInput('secret');
    const bodyStr = core.getInput('body', { required: true });

    core.debug(`dingToken: ${dingToken.substring(0, 8)}...`);
    core.debug(`secret: ${secret ? secret.substring(0, 4) + '...' : '(empty)'}`);
    core.debug(`body: ${bodyStr}`);

    // 2. 通过 dingToken 拼接 Webhook URL
    let url = `https://oapi.dingtalk.com/robot/send?access_token=${dingToken}`;

    // 3. 加签处理
    if (secret) {
      const { timestamp, sign: signStr } = sign(secret);
      url += `&timestamp=${timestamp}&sign=${signStr}`;
      core.debug(`sign url params: timestamp=${timestamp}, sign=${signStr}`);
    }

    core.debug(`request url: ${url.replace(dingToken, dingToken.substring(0, 8) + '...')}`);

    // 4. 解析 body
    const body = JSON.parse(bodyStr);

    core.info(`📤 发送钉钉通知`);

    // 5. 发送请求
    const result = await post(url, body);

    core.debug(`response: ${JSON.stringify(result)}`);

    // 6. 检查结果
    if (result.errcode !== 0) {
      throw new Error(`钉钉 API 错误: [${result.errcode}] ${result.errmsg}`);
    }

    core.info('✅ 钉钉通知发送成功');
    core.setOutput('result', JSON.stringify(result));
  } catch (error) {
    core.setFailed(`❌ 钉钉通知发送失败: ${error.message}`);
  }
}

run();
