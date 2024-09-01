const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const request = require("request");

app.use(
  "/api/baidu",
  createProxyMiddleware({
    target: "https://www.baidu.com",
    changeOrigin: true,
    pathRewrite: {
      "^/api/baidu": "",
    },
    onProxyRes: (proxyRes) => {
      proxyRes.headers["content-security-policy"] = "";
    },
  })
);

app.use(
  "/api/duckduckgo",
  createProxyMiddleware({
    target: "https://duckduckgo.com",
    changeOrigin: true,
    pathRewrite: { "^/api/duckduckgo": "" },
    onProxyRes: (proxyRes) => {
      delete proxyRes.headers["content-security-policy"];
      delete proxyRes.headers["x-frame-options"];
    },
  })
);

// 启动服务器
app.listen(3002, () => {
  console.log("Proxy server is running on http://localhost:3000");
});
