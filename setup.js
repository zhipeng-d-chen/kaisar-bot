import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';

function generateUUID() {
    return crypto.randomUUID();
}

function getTokensFromFile() {
    try {
        const tokens = fs.readFileSync('tokens.txt', 'utf-8').split('\n').filter(token => token.trim() !== '');
        return tokens;
    } catch (error) {
        console.error("读取 tokens.txt 时出错:", error.message || error);
        return [];
    }
}

function saveUUIDToFile(uuid) {
    try {
        fs.appendFileSync('id.txt', uuid + '\n');
        console.log('扩展 ID 已保存到 id.txt');
    } catch (error) {
        console.error("保存扩展 ID 到文件时出错:", error.message || error);
    }
}

async function startFarmingWithToken(token) {
    const extensionId = generateUUID();  
    const apiClient = axios.create({
        baseURL: 'https://zero-api.kaisar.io/',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`  
        }
    });

    let miningData = null;

    async function startFarming() {
        try {
            console.log("创建", { extensionId }, "尝试开始挖矿");

            const response = await apiClient.post('/mining/start', {
                extension: extensionId
            });
            if (response.status === 200) {
                console.log("挖矿成功启动:");
                saveUUIDToFile(extensionId);   
            }
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                console.error('启动挖矿时出错 (HTTP 错误):', {
                    status,
                });

                if (status === 412) {
                    console.log("挖矿已使用其他 ID 启动。\n您必须手动将扩展 ID 放入 id.txt");
                    return; 
                }
            } else {
                console.error('启动挖矿时出错，请稍后再试');
            }
        }
    }
    await startFarming();
}

(async () => {
    const tokens = getTokensFromFile();
    for (const token of tokens) {
        await startFarmingWithToken(token); 
    }
})();
