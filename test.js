/**
 * 本地测试脚本
 * 用法: node test.js <dingToken> [secret]
 * 示例: node test.js "你的access_token" "SECxxx"
 */

const { execSync } = require('child_process');
const path = require('path');

const dingToken = process.argv[2];
const secret = process.argv[3] || '';

if (!dingToken) {
  console.error('❌ 缺少 dingToken 参数');
  console.log('用法: node test.js <dingToken> [secret]');
  console.log('示例: node test.js "你的access_token" "SECxxx"');
  process.exit(1);
}

const body = JSON.stringify({
  msgtype: 'markdown',
  markdown: {
    title: '本地测试通知',
    text: [
      '## 本地测试',
      '- **时间**: ' + new Date().toLocaleString('zh-CN'),
      '- **状态**: 成功',
    ].join('\n'),
  },
  at: { isAtAll: false },
});

// 设置环境变量模拟 GitHub Actions 输入
const env = {
  ...process.env,
  INPUT_DINGTOKEN: dingToken,
  INPUT_SECRET: secret,
  INPUT_BODY: body,
  GITHUB_ACTIONS: 'true',
};

console.log('📤 发送测试通知...\n');

try {
  execSync('node index.js', {
    cwd: path.join(__dirname),
    env,
    stdio: 'inherit',
  });
} catch (error) {
  // setFailed 会以非零退出码退出，这里不影响显示
}
