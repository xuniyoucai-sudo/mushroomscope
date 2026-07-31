import rss from '@astrojs/rss';
import { entryPath, getPublishedEntries } from '../lib/content';
export async function GET(context) {
  const posts = await getPublishedEntries();
  return rss({ title: 'MushroomScope', description: 'Explore the fascinating world of mushrooms.', site: context.site, items: posts.map(post => ({ title: post.data.title, description: post.data.description, pubDate: post.data.publishDate, link: entryPath(post) })) });
}
