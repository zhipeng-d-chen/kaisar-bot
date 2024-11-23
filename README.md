# kaisarnetwork脚本

![banner](image.png)

# kaisarnetwork Beta CLI 模式

## 功能

- 支持多个账户。
- 支持使用代理。

## 环境要求

- Node.js 20+
- 通过 `npm install` 安装依赖项

## 文件

- **如果你已经有账户，可以手动创建文件**
- `tokens.txt`：存储 access_tokens，每行一个账户。
- `id.txt`：存储扩展 ID，每行一个账户。
- `proxy.txt`：存储代理 URL 格式 `http://user:pass@ip:port`，每行一个代理。
- **如果你使用 CLI 注册，上述文件会自动填充，只需在 `email.txt` 中填写你的电子邮件。**
- `emails.txt`：存储电子邮件账户，每行一个账户。

## 使用方法

1. 克隆仓库：
   ```bash
   git clone https://github.com/Gzgod/kaisar.git
   cd kaisar
   ```
2. 安装依赖（如果安装一直转圈可以使用国内镜像）：
   ```bash
   npm install
   ```
   国内镜像：
      ```bash
      npm install -g cnpm --registry=https://registry.npmmirror.com
      cnpm install
3. 注册或登录来获取token（把要登录或者注册的邮箱文件放到email.txt里）：
   ```bash
   npm run register
   ```
4. 为新账户创建扩展 ID：
   ```bash
   npm run setup
   ```
5. 运行机器人：
   ```bash
   npm run start
   ```

希望这能满足你的需求。如果你有其他问题或需要进一步的帮助，请告诉我！
