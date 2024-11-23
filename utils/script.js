import { logger } from './logger.js';

async function getMiningData(apiClient, extensionId) {
    try {
        const response = await apiClient.get('/mining/current', {
            params: { extension: extensionId }
        });

        if (response.data && response.data.data) {
            const miningData = response.data.data;

            updateProgress(extensionId, miningData); 
            updateMiningPoint(extensionId, miningData); 

            if (miningData.ended === 1) {
                logger(`[${extensionId}] 挖矿已结束。正在领取挖矿点。`, 'debug');
                await claim(apiClient, extensionId);
            }
        }
    } catch (error) {
        logger(`[${extensionId}] 获取挖矿数据时出错`, 'error');
    }
}

function updateMiningPoint(extensionId, miningData) {
    const elapsedTimeInHours = (Date.now() - new Date(miningData.start).getTime() - miningData.miss) / 36e5;
    const points = elapsedTimeInHours * miningData.hourly;
    const miningPoint = Math.max(0, points);

    logger(`[${extensionId}] 积分: ${points}, 挖矿积分: ${miningPoint}, 已用时间（小时）: ${elapsedTimeInHours}`, 'warn');
}

function updateProgress(extensionId, miningData) {
    const currentTime = Date.now(); 
    const endTime = miningData.end;     
    
    const remainingTime = Math.max(0, endTime - currentTime); 

    logger(
        `[${extensionId}] 进度: 结束时间: ${endTime}, 当前时间: ${currentTime}, 剩余时间: ${remainingTime}`, 'warn'
    );
}

async function claim(apiClient, extensionId) {
    try {
        logger(`[${extensionId}] 正在领取挖矿积分...`);
        const { data } = await apiClient.post('/mining/claim', { extension: extensionId });
        logger(`[${extensionId}] 成功领取:`, 'success', data);
    } catch (error) {
        logger(`[${extensionId}] 领取时出错:`, 'error', error.message || error);
    }
}

export { getMiningData };
