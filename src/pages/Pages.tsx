import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Group, Stack, Text, Title } from '@ui8kit/core';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphql';
import { QUERIES, MUTATIONS } from '@/lib/mutations';

type Page = {
  pageId: number;
  id: string;
  title: string;
  slug: string;
  status: string;
};

export function PagesList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await fetchGraphQL<{ pages: { nodes: Page[] } }>({
        query: QUERIES.pages,
      });
      if (res.data?.pages?.nodes) {
        setPages(res.data.pages.nodes);
      }
    } catch (e) {
      console.error('Failed to load pages:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleDelete = async (page: Page) => {
    if (!confirm(`Are you sure you want to delete "${page.title}"?`)) return;
    
    setDeleting(page.pageId);
    try {
      const res = await fetchGraphQL({
        query: MUTATIONS.deletePage,
        variables: { input: { id: page.id } },
      });
      
      if (res.errors) {
        alert(`Failed to delete: ${res.errors[0].message}`);
      } else {
        setPages(pages.filter(p => p.pageId !== page.pageId));
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
    setDeleting(null);
  };

  return (
    <Stack gap="lg">
      <Group justify="between" align="center">
        <div>
          <Title order={2}>Pages</Title>
          <Text color="muted">{pages.length} pages</Text>
        </div>
        <Group gap="sm">
          <Button variant="outline" onClick={loadPages} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button onClick={() => navigate('/pages/new')}>
            <Plus size={16} />
            <span className="ml-2">New Page</span>
          </Button>
        </Group>
      </Group>

      {loading ? (
        <Card>
          <Text color="muted" className="text-center py-8">Loading pages...</Text>
        </Card>
      ) : pages.length === 0 ? (
        <Card>
          <Stack gap="md" className="text-center py-8">
            <Text color="muted">No pages found</Text>
            <Button onClick={() => navigate('/pages/new')}>Create your first page</Button>
          </Stack>
        </Card>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <Card key={page.pageId} className="hover:border-primary/50 transition-colors">
              <Group justify="between" align="center">
                <Stack gap="xs">
                  <Group gap="sm" align="center">
                    <Title order={5}>{page.title || '(Untitled)'}</Title>
                    <Text size="xs" className={`px-2 py-0.5 rounded ${
                      page.status === 'publish' ? 'bg-green-500/10 text-green-600' :
                      'bg-yellow-500/10 text-yellow-600'
                    }`}>
                      {page.status}
                    </Text>
                  </Group>
                  <Text size="sm" color="muted">/{page.slug}</Text>
                </Stack>
                <Group gap="xs">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => navigate(`/pages/${page.pageId}`)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(page)}
                    disabled={deleting === page.pageId}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </Group>
              </Group>
            </Card>
          ))}
        </div>
      )}
    </Stack>
  );
}

