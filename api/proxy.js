export default async function handler(req, res) {
    // 1. 设置 CORS 头
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
        const requestBody = req.body || null;
        const authHeader = req.headers.authorization || `Bearer ${apiKey || ""}`;

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,
            },
            body: requestBody ? JSON.stringify(requestBody) : undefined,
        });

        // 读取 body（只读取一次）
        const contentType = response.headers.get("content-type") || "";
        let data;
        
        if (contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // 直接返回数据，不再尝试读取 response
        return res.status(response.status).json(data);

    } catch (error) {
        return res.status(500).json({
            error: "Proxy error",
            details: error.message,
            tip: "请检查 Vercel 环境变量是否正确，以及学校 API 是否正常运行。"
        });
    }
}