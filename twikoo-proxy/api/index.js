/**
 * Twikoo 项目（单独的那个 Vercel 项目）里的 api/index.js —— 用这个文件整个替换它。
 *
 * 作用：博客的 /api/twikoo 代理会把访客真实 IP 放在 `x-twikoo-client-ip` 里转发过来，
 * 这里把它还原成 Twikoo 读取 IP 的 `x-real-ip` / `x-forwarded-for`。
 * （Vercel 会改写这两个头，所以不能直接让代理去设置它们。）
 *
 * 防伪造：在 Twikoo 项目里加同名环境变量 TWIKOO_PROXY_SECRET（和博客那边的值一样）。
 * 设置后，只有带正确密钥的请求才会被信任；直接访问 Twikoo 地址的请求仍按原来的 IP 处理。
 */
const vercel = require("twikoo-vercel");
const handler = vercel.default ?? vercel;

module.exports = function (req, res) {
  try {
    const ip = req.headers["x-twikoo-client-ip"];
    const secret = process.env.TWIKOO_PROXY_SECRET;
    const trusted = !secret || req.headers["x-twikoo-proxy-secret"] === secret;
    if (ip && trusted) {
      req.headers["x-real-ip"] = ip;
      req.headers["x-forwarded-for"] = ip;
    }
  } catch (e) {
    console.error("[twikoo ip wrapper]", e);
  }
  return handler(req, res);
};
module.exports.default = module.exports;
