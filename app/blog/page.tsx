// app/blog/page.tsx
// 从正确的相对路径导入 sanity client
import { client } from '../../sanity/sanity.client'

interface Post {
  _id: string
  title: string
  slug: string
}

const QUERY = `*[_type == "post"] | order(_createdAt desc){
  _id, title, "slug": slug.current
}`

export default async function BlogIndex() {
  const posts = await client.fetch(QUERY)

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold mb-4">Blog</h1>
      <ul className="space-y-3">
        {posts?.map((p: Post) => (
          <li key={p._id}>
            <a className="underline" href={`/blog/${p.slug}`}>{p.title}</a>
          </li>
        ))}
      </ul>
    </main>
  )
}
