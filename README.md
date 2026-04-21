# actions-dingding

通过钉钉自定义机器人 Webhook 发送通知的 GitHub Action。

## 功能

- 接收 `dingToken` 自动拼接 Webhook URL
- 支持加签（HMAC-SHA256）安全验证
- 请求体 `body` 直接透传，完全由调用方控制消息格式
- 零外部依赖，使用 Node.js 原生 `https` 模块

## 使用方法

### 基本用法

```yaml
- name: 钉钉通知
  uses: your-username/actions-dingding@main
  with:
    dingToken: ${{ secrets.DINGTALK_TOKEN }}
    body: |
      {
        "msgtype": "markdown",
        "markdown": {
          "title": "构建通知",
          "text": "## 构建成功\n- **仓库**: ${{ github.repository }}\n- **分支**: ${{ github.ref_name }}"
        }
      }
```

### 加签模式

```yaml
- name: 钉钉通知
  uses: your-username/actions-dingding@main
  with:
    dingToken: ${{ secrets.DINGTALK_TOKEN }}
    secret: ${{ secrets.DINGTALK_SECRET }}
    body: |
      {
        "msgtype": "markdown",
        "markdown": {
          "title": "构建通知",
          "text": "## 构建成功\n- **仓库**: ${{ github.repository }}\n- **分支**: ${{ github.ref_name }}\n- **提交者**: ${{ github.actor }}"
        }
      }
```

### @人

```yaml
- name: 钉钉通知
  uses: your-username/actions-dingding@main
  with:
    dingToken: ${{ secrets.DINGTALK_TOKEN }}
    body: |
      {
        "msgtype": "markdown",
        "markdown": {
          "title": "紧急通知",
          "text": "## 部署失败\n请立即查看！"
        },
        "at": {
          "atMobiles": ["13800138000", "13900139000"],
          "isAtAll": false
        }
      }
```

### @所有人

```yaml
- name: 钉钉通知
  uses: your-username/actions-dingding@main
  with:
    dingToken: ${{ secrets.DINGTALK_TOKEN }}
    body: |
      {
        "msgtype": "markdown",
        "markdown": {
          "title": "发布通知",
          "text": "## 生产环境发布"
        },
        "at": { "isAtAll": true }
      }
```

### text 类型消息

```yaml
- name: 钉钉通知
  uses: your-username/actions-dingding@main
  with:
    dingToken: ${{ secrets.DINGTALK_TOKEN }}
    body: |
      {
        "msgtype": "text",
        "text": { "content": "构建完成！" }
      }
```

## 输入参数

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `dingToken` | 是 | - | 钉钉机器人 access_token（用于拼接 Webhook URL） |
| `secret` | 否 | - | 加签密钥（机器人安全设置中的"加签"密钥） |
| `body` | 是 | - | 请求体 JSON 字符串，直接透传给钉钉 API |

## 输出参数

| 参数 | 说明 |
|------|------|
| `result` | 钉钉 API 返回的 JSON 结果 |

## Secrets 配置

在仓库 **Settings → Secrets and variables → Actions** 中添加：

| Secret | 说明 |
|--------|------|
| `DINGTALK_TOKEN` | 钉钉机器人 access_token（Webhook URL 中 `access_token=` 后的值） |
| `DINGTALK_SECRET` | 加签密钥（SEC 开头的字符串，如使用加签安全设置则必填） |

## 钉钉机器人创建步骤

1. 打开钉钉群 → **群设置 → 智能群助手 → 添加机器人 → 自定义**
2. 安全设置选择**加签**，复制 SEC 开头的密钥
3. 复制 Webhook 地址中 `access_token=` 后的值作为 `dingToken`
4. 将 `dingToken` 和密钥分别配置为 GitHub Secrets

## 本地测试

```bash
# 安装依赖
npm install

# 运行测试
node test.js "你的access_token" "SEC你的密钥"
```

## 开发

```bash
# 构建（生成 dist/index.js）
npm run build
```

## License

MIT
