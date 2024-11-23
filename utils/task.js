import { logger, HttpsProxyAgent, axios } from './exporter.js';

function createApiClient(proxy, token) {
    const agent = new HttpsProxyAgent(proxy);
    return axios.create({
        baseURL: 'https://zero-api.kaisar.io/',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        agent,
    });
}

async function fetchMissionTasks(extensionId, proxy, token) {
    const apiClient = createApiClient(proxy, token); 

    try {
        const response = await apiClient.get('mission/tasks');
        const tasks = response.data.data; 
        const activeTaskIds = tasks
            .filter(task => task.status === 1)  
            .map(task => task._id);            

        if (activeTaskIds.length > 0) {
            logger(`[${extensionId}] 发现完成的任务，任务ID: ${activeTaskIds}`, 'warn');
        }

        return activeTaskIds;
    } catch (error) {
        logger(`[${extensionId}] 获取任务时出错`, 'error');
        return null;
    }
}

let payload = {referrer: "EoKtoJ377"}

async function claimMissionTasks(extensionId, proxy, token, taskIds) {
    const apiClient = createApiClient(proxy, token); 

    for (let taskId of taskIds) {
        try {
            const response = await apiClient.post(`mission/tasks/${taskId}/claim`, {});
            const task = response.data.data; 
            logger(`[${extensionId}] 从任务ID领取奖励: ${taskId} ${task}`, 'success');
        } catch (error) {
            logger(`[${extensionId}] 领取任务ID ${taskId} 时出错`, 'error');
        }
    }
}

export { payload as headers }

export async function dailyCheckin(extensionId, proxy, token) {
    const apiClient = createApiClient(proxy, token); 

    try {
        const response = await apiClient.post('checkin/check', {});
        const checkin = response.data.data; 
        if (checkin) { 
            logger(`[${extensionId}] 每日签到成功 ${checkin.time}`, 'success');
        }
    } catch (error) {
        logger(`[${extensionId}] 签到时出错: 今天已经签到...`, 'error');
    }
}

export async function checkAndClaimTask(extensionId, proxy, token) {
    const taskIds = await fetchMissionTasks(extensionId, proxy, token);
    if (taskIds && taskIds.length > 0) {
        await claimMissionTasks(extensionId, proxy, token, taskIds);
    } else {
        logger(`[${extensionId}] 没有可领取的任务...`);
    }
}
