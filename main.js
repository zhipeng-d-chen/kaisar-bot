import * as Upils from './utils/exporter.js';

async function pingAndUpdate(token, extensionId) {
    const apiClient = Upils.axios.create({
        baseURL: 'https://zero-api.kaisar.io/',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        }
    });

    try {
        const response = await apiClient.post('/extension/ping', {
            extension: extensionId
        });

        Upils.logger(`[${extensionId}] Ping 响应:`, 'info', response.data.data);
        await Upils.getMiningData(apiClient, extensionId);  
    } catch (error) {
        Upils.logger(`[${extensionId}] Ping 错误`, 'error');
    }
}

async function checkAndClaimTask(extensionId, token) {
    const apiClient = Upils.axios.create({
        baseURL: 'https://zero-api.kaisar.io/',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        }
    });

    try {
        // 示例逻辑
        const response = await apiClient.get(`/extension/${extensionId}/tasks`);
        Upils.logger(`[${extensionId}] 获取任务响应:`, 'info', response.data);
    } catch (error) {
        Upils.logger(`[${extensionId}] 获取任务错误`, 'error');
    }
}

(async () => {
    Upils.logger(Upils.banner, 'debug');
    const tokens = Upils.getToken();
    const ids = Upils.getId();

    if (!tokens.length || !ids.length) {
        Upils.logger("未找到令牌或ID。退出...", 'error');
        return;
    }

    const lastExecution = {}; 

    while (true) {
        const now = Date.now();

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const extensionId = ids[i % ids.length];

            Upils.logger(`[${extensionId}] 开始 Ping 第 ${i + 1} 个账户`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await pingAndUpdate(token, extensionId);

            if (!lastExecution[token] || now - lastExecution[token] >= 24 * 60 * 60 * 1000) {
                Upils.logger(`[${extensionId}] 检查任务 第 ${i + 1} 个账户`);
                await checkAndClaimTask(extensionId, token);

                lastExecution[token] = now;
            }
        }

        Upils.logger(`[${new Date().toISOString()}] 冷却 1 分钟...`);
        await new Promise(resolve => setTimeout(resolve, 60000)); // 等待 1 分钟
    }
})();
