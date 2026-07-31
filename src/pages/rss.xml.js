import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
export async function GET(context) {
  const posts = (await getCollection('articles', ({ data }) => !data.draft)).sort((a,b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
  return rss({ title: 'MushroomScope', description: 'Explore the fascinating world of mushrooms.', site: context.site, items: posts.map(post => ({ title: post.data.title, description: post.data.description, pubDate: post.data.publishDate, link: `/${post.id}/` })) });
}
