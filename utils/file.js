import fs from 'fs';
import { logger } from './logger.js';

function getTokensFromFile() {
    try {
        const tokens = fs.readFileSync('tokens.txt', 'utf-8').split('\n').filter(token => token.trim() !== '');
        return tokens;
    } catch (error) {
        logger("读取 token.txt 时出错:", 'error', error.message || error);
        return [];
    }
}

function getIdsFromFile() {
    try {
        const ids = fs.readFileSync('id.txt', 'utf-8').split('\n').filter(id => id.trim() !== '');
        return ids;
    } catch (error) {
        logger("读取 id.txt 时出错:", 'error', error.message || error);
        return [];
    }
}

function getProxiesFromFile() {
    try {
        const proxies = fs.readFileSync('proxy.txt', 'utf-8').split('\n').filter(proxy => proxy.trim() !== '');
        return proxies;
    } catch (error) {
        logger("读取 proxy.txt 时出错:", 'error', error.message || error);
        return [];
    }
}

export { getTokensFromFile as getToken, getIdsFromFile as getId, getProxiesFromFile as getProxy }
