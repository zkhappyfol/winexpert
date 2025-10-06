const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // 拦截所有以 /api 开头的请求
    createProxyMiddleware({
      target: 'https://dashscope.aliyuncs.com', // 明确目标服务器
      changeOrigin: true,
      pathRewrite: {
        // 将请求路径中的 /api 替换为 /compatible-mode/v1
        // 例如: /api/chat/completions -> /compatible-mode/v1/chat/completions
        '^/api': '/compatible-mode/v1',
      },
      // ▼▼▼ 添加下面的日志记录功能 ▼▼▼
      onProxyReq: (proxyReq, req, res) => {
        // 在终端打印出代理转发的真实请求地址
        const fullPath = proxyReq.protocol + '//' + proxyReq.host + proxyReq.path;
        console.log('[Proxy] 正在转发请求到:', fullPath);
      },
      onError: (err, req, res) => {
        console.error('[Proxy] 代理出错:', err);
      }
    })
  );
};