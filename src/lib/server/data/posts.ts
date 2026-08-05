import rawPosts from './mocks/posts.json';
import { PostsSchema } from '$lib/server/schemas/post';
import { queryPosts, type PostsQuery } from './query-posts';

const POSTS = PostsSchema.parse(rawPosts);

export function getPosts(query: PostsQuery) {
	return queryPosts(POSTS, query);
}

export function getPostBySlug(slug: string) {
	return POSTS.find((post) => post.slug === slug) ?? null;
}

export function getAllSlugs() {
	return POSTS.map((post) => post.slug);
}
