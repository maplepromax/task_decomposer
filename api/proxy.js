export default async function handler(req, res) {
    // 1. 【CORS 头部】放在最前面，确保任何响应都有
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理 OPTIONS 请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const targetUrl = process.env.TARGET_API_URL;
    const apiKey = process.env.SCHOOL_API_KEY;

    try {
        // 2. 【请求体】安全地从 Vercel/Node.js 环境中获取请求体
        const requestBody = req.body || null; 
        
        // 确保 Authorization 的优先级
        const authHeader = req.headers.authorization || `Bearer ${apiKey || ""}`;

        // 3. 【转发请求】
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,
            },
            body: requestBody ? JSON.stringify(requestBody) : undefined,
        });
        
        // 4. 【关键防御：处理响应】
        
        // 4a. 检查状态码
        if (!response.ok) {
            // 如果 API 返回错误状态 (如 401, 500)
            
            // 使用 response.clone() 来应对流被预读的问题
            const clonedResponse = response.clone(); 
            
            // 尝试读取文本格式的错误信息
            const errorText = await clonedResponse.text(); 
            
            // 返回 API 的错误状态码和错误信息
            return res.status(response.status).send(errorText);
        }

        // 4b. 如果响应 OK (200-299)
        
        // 再次使用 response.clone() 来应对流被预读的问题
        const clonedResponse = response.clone();
        
        // 尝试将其读成 JSON
        const responseData = await clonedResponse.json(); 
        
        // 返回数据给你的 HTML 客户端
        res.status(response.status).json(responseData); 

    } catch (error) {
        // 5. 处理代理自身的错误（例如网络连接失败、JSON 解析失败）
        res.status(500).json({ 
            error: "Proxy error", 
            details: error.message,
            tip: "请检查 Vercel 环境变量是否正确，以及学校 API 是否正常运行。"
        });
    }
}