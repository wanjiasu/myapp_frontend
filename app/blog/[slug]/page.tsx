// app/blog/[slug]/page.tsx
import { client } from '@/sanity/sanity.client'
import { PortableText } from '@portabletext/react'

type Props = { 
  params: Promise<{ slug: string }> 
}

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  title,
  body
}`

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await client.fetch(POST_QUERY, { slug })

  if (!post) return <div className="p-6">文章不存在</div>

  return (
    <article className="mx-auto max-w-2xl p-6 prose">
      <h1>{post.title}</h1>
      {/* body 若是 Portable Text（常见），用 PortableText 渲染 */}
      <PortableText value={post.body} />
    </article>
  )
}
