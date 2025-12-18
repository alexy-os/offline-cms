import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Group, Stack, Text, Title } from '@ui8kit/core';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphql';
import { QUERIES, MUTATIONS } from '@/lib/mutations';

type PostFormData = {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: 'publish' | 'draft' | 'pending';
};

export function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [form, setForm] = useState<PostFormData>({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    status: 'draft',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  useEffect(() => {
    if (!isNew && id) {
      loadPost(id);
    }
  }, [id, isNew]);

  const loadPost = async (postDbId: string) => {
    setLoading(true);
    try {
      const res = await fetchGraphQL<{ post: any }>({
        query: QUERIES.post,
        variables: { id: postDbId },
      });
      if (res.data?.post) {
        const p = res.data.post;
        setPostId(p.id);
        setForm({
          title: p.title || '',
          content: p.content || '',
          excerpt: p.excerpt || '',
          slug: p.slug || '',
          status: p.status || 'draft',
        });
      }
    } catch (e) {
      console.error('Failed to load post:', e);
      setMessage({ type: 'error', text: 'Failed to load post' });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (isNew) {
        // Create new post
        const res = await fetchGraphQL({
          query: MUTATIONS.createPost,
          variables: {
            input: {
              title: form.title,
              content: form.content,
              excerpt: form.excerpt,
              status: form.status.toUpperCase(),
            },
          },
        });

        if (res.errors) {
          setMessage({ type: 'error', text: res.errors[0].message });
        } else if (res.extensions?.queued) {
          setMessage({ type: 'warning', text: 'Post queued for creation when online.' });
          setTimeout(() => navigate('/posts'), 2000);
        } else {
          setMessage({ type: 'success', text: 'Post created!' });
          setTimeout(() => navigate('/posts'), 1000);
        }
      } else {
        // Update existing post
        const res = await fetchGraphQL({
          query: MUTATIONS.updatePost,
          variables: {
            input: {
              id: postId,
              title: form.title,
              content: form.content,
              excerpt: form.excerpt,
              status: form.status.toUpperCase(),
            },
          },
        });

        if (res.errors) {
          setMessage({ type: 'error', text: res.errors[0].message });
        } else if (res.extensions?.queued) {
          setMessage({ type: 'warning', text: 'Update queued for when online.' });
        } else {
          setMessage({ type: 'success', text: 'Post updated!' });
        }
      }
    } catch (e) {
      console.error('Save failed:', e);
      setMessage({ type: 'error', text: 'Failed to save post' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <Stack gap="md" className="text-center py-12">
          <Loader2 className="animate-spin mx-auto" size={32} />
          <Text color="muted">Loading post...</Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="between" align="center">
        <Group gap="md" align="center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/posts')}>
            <ArrowLeft size={20} />
          </Button>
          <Title order={2}>{isNew ? 'New Post' : 'Edit Post'}</Title>
        </Group>
      </Group>

      {message && (
        <Card className={`border-l-4 ${
          message.type === 'success' ? 'border-l-green-500 bg-green-500/5' :
          message.type === 'warning' ? 'border-l-yellow-500 bg-yellow-500/5' :
          'border-l-red-500 bg-red-500/5'
        }`}>
          <Text>{message.text}</Text>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Card>
            <Stack gap="md">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Post title"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={12}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  placeholder="Post content (HTML supported)"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium mb-1">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Short description"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="publish">Published</option>
                  <option value="pending">Pending Review</option>
                </select>
              </div>
            </Stack>
          </Card>

          {/* Actions */}
          <Group justify="end" gap="sm">
            <Button type="button" variant="outline" onClick={() => navigate('/posts')}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span className="ml-2">{saving ? 'Saving...' : 'Save'}</span>
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}

