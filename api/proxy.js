export default async function handler(req, res) {
    // 1. 设置 CORS 头，允许任何来源访问 (解决浏览器安全限制)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理 OPTIONS 请求（CORS 预检请求）
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const targetUrl = process.env.TARGET_API_URL; // 例如 https://school.edu/v1/chat/completions
    const apiKey = process.env.SCHOOL_API_KEY; // 从环境变量读取

    try {
        // 2. 修正：安全地从 Vercel/Node.js 环境中获取请求体
        // Vercel 已经解析了 JSON，可以直接使用 req.body
        const requestBody = req.body || null; 
        
        // 确保 API Key 的优先级：优先使用用户在HTML设置中输入的，其次使用环境变量
        const authHeader = req.headers.authorization || `Bearer ${apiKey || ""}`;

        // 3. 将请求转发到学校 API
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,
            },
            // 如果请求体存在，将其 JSON 字符串化后发送
            body: requestBody ? JSON.stringify(requestBody) : undefined,
        });

        // 4. 关键修正：检查响应状态并读取 JSON
        // 如果 API 响应状态码不是 200-299 范围内 (如 400, 500)，则它可能包含错误信息
        if (!response.ok) {
            // 尝试将错误信息读成文本（更通用，防止非 JSON 错误）
            const errorText = await response.text(); 
            // 将 API 的错误状态码和信息返回给客户端
            return res.status(response.status).send(errorText);
        }

        // 5. 关键修正：如果响应 OK，将其读成 JSON 并返回
        const responseData = await response.json(); 
        
        // 6. 返回数据给你的 HTML 客户端
        // Vercel/Next.js 的 res.json() 会自动设置 Content-Type: application/json
        res.status(response.status).json(responseData); 

    } catch (error) {
        // 7. 处理网络或解析错误
        res.status(500).json({ 
            error: "Proxy error", 
            details: error.message,
            tip: "请检查 Vercel 环境变量 TARGET_API_URL 和 SCHOOL_API_KEY 是否正确配置。"
        });
    }
}