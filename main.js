import * as Upils from './utils/exporter.js';

async function pingAndUpdate(token, extensionId, proxy) {
    const agent = new Upils.HttpsProxyAgent(proxy);

    const apiClient = Upils.axios.create({
        baseURL: 'https://zero-api.kaisar.io/',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        agent,
    });

    try {
        const response = await apiClient.post('/extension/ping', {
            extension: extensionId
        });

        Upils.logger(`[${extensionId}] Ping 响应:`, 'info', response.data.data);
        await Upils.getMiningData(apiClient, extensionId);  
    } catch (error) {
        Upils.logger(`[${extensionId}] Ping 错误，使用代理 ${proxy}`, 'error');
    }
}

(async () => {
    Upils.logger(Upils.banner, 'debug');
    const tokens = Upils.getToken();
    const ids = Upils.getId();
    const proxies = Upils.getProxy();

    if (!tokens.length || !ids.length || !proxies.length) {
        Upils.logger("未找到令牌、ID 或代理。退出...", 'error');
        return;
    }

    const lastExecution = {}; 

    while (true) {
        const now = Date.now();

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const extensionId = ids[i % ids.length];
            const proxy = proxies[i % proxies.length];

            Upils.logger(`[${extensionId}] 开始 Ping 第 ${i + 1} 个账户，使用代理 ${proxy}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await pingAndUpdate(token, extensionId, proxy);

            if (!lastExecution[token] || now - lastExecution[token] >= 24 * 60 * 60 * 1000) {
                Upils.logger(`[${extensionId}] 检查任务 第 ${i + 1} 个账户`);
                await Upils.checkAndClaimTask(extensionId, proxy, token);
                await Upils.dailyCheckin(extensionId, proxy, token);

                lastExecution[token] = now;
            }
        }

        Upils.logger(`[${new Date().toISOString()}] 冷却 1 分钟...`);
        await new Promise(resolve => setTimeout(resolve, 60000)); // 等待 1 分钟
    }
})();
