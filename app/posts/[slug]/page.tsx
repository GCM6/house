import { unstable_cache } from 'next/cache';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { format } from 'date-fns';

import client from '@/tina/__generated__/client';

import { StackBlitzEmbed } from '@/components/stack-blitz-embed';
import { GitHubGistEmbed } from '@/components/github-gist-embed';
import { CodeBlock } from '@/components/code-block';
import { CodeSandboxEmbed } from '@/components/code-sandbox-embed';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
  const { data } = await client.queries.post({ relativePath: `${params.slug}.mdx` });

  return {
    title: data.post.title,
  };
}

export async function generateStaticParams() {
  const { data } = await client.queries.postConnection();

  if (!data.postConnection.edges) {
    return [];
  }

  return data.postConnection.edges.map((post) => ({
    slug: post?.node?._sys.breadcrumbs.join('/'),
  }));
}

export default async function Post({ params }: Props) {
  const cacheKey = `post-${params.slug}`;

  const { data } = await unstable_cache(
    () => client.queries.post({ relativePath: `${params.slug}.mdx` }),
    [cacheKey],
    { tags: [cacheKey] }
  )();

  return (
    <article className="prose dark:prose-invert prose-p:text-lg">
      <h1 className="mb-3">{data.post.title}</h1>
      <time className="text-text-muted" dateTime={data.post.date}>
        {format(new Date(data.post.date), 'yyyy-MM-dd')}
      </time>

      <TinaMarkdown
        content={data.post.body}
        components={{
          CodeSandboxEmbed,
          StackBlitzEmbed,
          GitHubGistEmbed,
          code_block: CodeBlock,
        }}
      />
    </article>
  );
}
