module.exports = {
  apps: [
    {
      name: "betaione_frontend",
      script: "pnpm",
      args: "run start",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
  ],
};
