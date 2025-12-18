import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Group, Stack, Text, Title } from '@ui8kit/core';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphql';
import { QUERIES, MUTATIONS } from '@/lib/mutations';

type PageFormData = {
  title: string;
  content: string;
  slug: string;
  status: 'publish' | 'draft';
};

export function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [form, setForm] = useState<PageFormData>({
    title: '',
    content: '',
    slug: '',
    status: 'draft',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  useEffect(() => {
    if (!isNew && id) {
      loadPage(id);
    }
  }, [id, isNew]);

  const loadPage = async (pageDbId: string) => {
    setLoading(true);
    try {
      const res = await fetchGraphQL<{ page: any }>({
        query: QUERIES.page,
        variables: { id: pageDbId },
      });
      if (res.data?.page) {
        const p = res.data.page;
        setPageId(p.id);
        setForm({
          title: p.title || '',
          content: p.content || '',
          slug: p.slug || '',
          status: p.status || 'draft',
        });
      }
    } catch (e) {
      console.error('Failed to load page:', e);
      setMessage({ type: 'error', text: 'Failed to load page' });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (isNew) {
        const res = await fetchGraphQL({
          query: MUTATIONS.createPage,
          variables: {
            input: {
              title: form.title,
              content: form.content,
              status: form.status.toUpperCase(),
            },
          },
        });

        if (res.errors) {
          setMessage({ type: 'error', text: res.errors[0].message });
        } else if (res.extensions?.queued) {
          setMessage({ type: 'warning', text: 'Page queued for creation when online.' });
          setTimeout(() => navigate('/pages'), 2000);
        } else {
          setMessage({ type: 'success', text: 'Page created!' });
          setTimeout(() => navigate('/pages'), 1000);
        }
      } else {
        const res = await fetchGraphQL({
          query: MUTATIONS.updatePage,
          variables: {
            input: {
              id: pageId,
              title: form.title,
              content: form.content,
              status: form.status.toUpperCase(),
            },
          },
        });

        if (res.errors) {
          setMessage({ type: 'error', text: res.errors[0].message });
        } else if (res.extensions?.queued) {
          setMessage({ type: 'warning', text: 'Update queued for when online.' });
        } else {
          setMessage({ type: 'success', text: 'Page updated!' });
        }
      }
    } catch (e) {
      console.error('Save failed:', e);
      setMessage({ type: 'error', text: 'Failed to save page' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <Stack gap="md" className="text-center py-12">
          <Loader2 className="animate-spin mx-auto" size={32} />
          <Text color="muted">Loading page...</Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="between" align="center">
        <Group gap="md" align="center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/pages')}>
            <ArrowLeft size={20} />
          </Button>
          <Title order={2}>{isNew ? 'New Page' : 'Edit Page'}</Title>
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
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Page title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={15}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  placeholder="Page content (HTML supported)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="publish">Published</option>
                </select>
              </div>
            </Stack>
          </Card>

          <Group justify="end" gap="sm">
            <Button type="button" variant="outline" onClick={() => navigate('/pages')}>
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

