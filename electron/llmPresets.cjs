module.exports = {
  PRESETS: [
    {
      presetId: "deepseek-v4-flash",
      name: "DeepSeek V4 Flash",
      kind: "openai-compat",
      baseUrl: "https://api.deepseek.com/v1",
      defaultModel: "deepseek-v4-flash",
      description: "DeepSeek V4 非思考模式。1M 上下文,384K 输出上限。日常起草/对话首选。",
      supportsToolUse: true,
      defaultMaxTokens: 384000,
    },
    {
      presetId: "deepseek-v4-pro",
      name: "DeepSeek V4 Pro",
      kind: "openai-compat",
      baseUrl: "https://api.deepseek.com/v1",
      defaultModel: "deepseek-v4-pro",
      description: "DeepSeek V4 高能力模型。1M 上下文,384K 输出上限,默认思考模式。适合方法论/讨论深度推敲、审稿回复信构思。2026/05/31 前 75% 折扣。",
      supportsToolUse: true,
      defaultMaxTokens: 384000,
    },
  ],
};
