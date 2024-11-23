import { axios, banner, headers, readline, logger, fs } from './utils/exporter.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function saveTokenToFile(token) {
    try {
        fs.appendFileSync('tokens.txt', token + '\n');
        console.log('访问令牌已保存到 tokens.txt');
    } catch (error) {
        console.error("保存令牌到文件时出错:", error.message);
    }
}

async function loginUser(email, password) {
    try {
        const response = await axios.post(
            'https://zero-api.kaisar.io/auth/login',
            { email, password },
            { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.data) {
            const token = response.data.data.accessToken;
            console.log(`登录成功 ${email} 令牌:`, token);
            
            saveTokenToFile(token);
        } else {
            console.error(`登录失败 ${email}:`, response.data.message);
        }
    } catch (error) {
        console.error(`登录时出错 ${email} 请确保您已确认电子邮件`);
    }
}

async function registerUser(email, password, referrer) {
    try {
        const response = await axios.post(
            'https://zero-api.kaisar.io/auth/register',
            {
                email: email,
                password: password,
                referrer: referrer  
            },
            { headers: { 'Content-Type': 'application/json' } }
        );
        if (response.data) {
            console.log(`注册成功 ${email}:`, response.data);
            console.log("检查您的收件箱以确认您的电子邮件...\n然后重新运行此脚本以登录...");
        } else {
            console.error(`注册失败 ${email}:`, response.data.message);
        }
    } catch (error) {
        if (error.response?.data?.error?.code === 410) {
            console.log(`电子邮件已存在 ${email}, 尝试登录...`);
            await loginUser(email, password);
        } else {
            console.error(`注册时出错 ${email} 请重试..`);
        }
    }
}

async function processAllUsers() {
    try {
        logger(banner, 'debug');
        const emailList = fs.readFileSync('emails.txt', 'utf-8').split('\n').filter(email => email.trim() !== '');

        rl.question("输入您的账户密码: ", async (password) => {
            rl.question("输入您的邀请码: ", async (referrer) => {
                for (const email of emailList) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); 
                    await registerUser(email, password, referrer); 
                }
                rl.close();
            });
        });

    } catch (error) {
        console.error("读取 emails.txt 文件时出错:", error.message);
    }
}

processAllUsers();
