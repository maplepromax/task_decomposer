export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

        const contentType = response.headers.get("content-type") || "";
        
        // 根据内容类型返回相应格式
        if (contentType.includes("application/json")) {
            const data = await response.json();
            return res.status(response.status).json(data);
        } else {
            const data = await response.text();
            return res.status(response.status).send(data);
        }

    } catch (error) {
        return res.status(500).json({
            error: "Proxy error",
            details: error.message,
            tip: "请检查 Vercel 环境变量是否正确，以及学校 API 是否正常运行。"
        });
    }
}