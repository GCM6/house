import { format } from 'date-fns';

import { Markdown } from '@/components/markdown';
import client from '@/tina/__generated__/client';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
  const { data } = await client.queries.note({ relativePath: `${params.slug}.mdx` });

  return {
    title: data.note.title,
  };
}

export async function generateStaticParams() {
  const { data } = await client.queries.noteConnection();

  if (!data.noteConnection.edges) {
    return [];
  }

  return data.noteConnection.edges.map((note) => ({
    slug: note?.node?._sys.breadcrumbs.join('/'),
  }));
}

export const revalidate = 3600;

export default async function Note({ params }: Props) {
  const { data } = await client.queries.note({ relativePath: `${params.slug}.mdx` });

  return (
    <article className="prose max-w-none dark:prose-invert prose-p:text-lg prose-pre:rounded-none">
      <h1 className="mb-5">{data.note.title}</h1>

      <time className="block text-lg text-text-muted" dateTime={data.note.date}>
        {format(new Date(data.note.date), 'MMM dd, yyyy')}
      </time>

      <Markdown content={data.note.body} />
    </article>
  );
}
