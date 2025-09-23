import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!, // 在 .env 里配置
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01', // 任意未来日期即可固定 schema
  useCdn: true,             // 线上开 true，草稿预览则需要 false + token
  token: process.env.SANITY_READ_TOKEN, // 可选：读草稿时用
})