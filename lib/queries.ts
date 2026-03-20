import { client } from './sanity'

export async function getPost(slug: string) {
    return await client.fetch(
        `*[_type == "post" && slug.current == $slug && defined(publishedAt) && publishedAt <= now()][0] {
      _id,
      title,
      "date": publishedAt,
      "category": categories[0]->title,
      "slug": slug.current,
      "readTime": readTime,
      "author": author->{
        name,
        role
      },
      mainImage,
      body
    }`,
        { slug }
    )
}

export async function getAllSlugs() {
    return await client.fetch(
        `*[_type == "post" && defined(publishedAt) && publishedAt <= now()] { "slug": slug.current }`
    )
}