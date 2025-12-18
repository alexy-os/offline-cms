import { useEffect, useState } from 'react';
import { Button, Card, Group, Stack, Text, Title } from '@ui8kit/core';
import { Plus, Edit, Trash2, RefreshCw, X, Check } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphql';
import { QUERIES, MUTATIONS } from '@/lib/mutations';

type Category = {
  categoryId: number;
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
};

export function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetchGraphQL<{ categories: { nodes: Category[] } }>({
        query: QUERIES.categories,
      });
      if (res.data?.categories?.nodes) {
        setCategories(res.data.categories.nodes);
      }
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetchGraphQL({
        query: MUTATIONS.createCategory,
        variables: {
          input: { name: form.name, description: form.description },
        },
      });
      if (!res.errors) {
        loadCategories();
        setCreating(false);
        setForm({ name: '', description: '' });
      } else {
        alert(res.errors[0].message);
      }
    } catch (e) {
      console.error('Create failed:', e);
    }
    setSaving(false);
  };

  const handleUpdate = async (cat: Category) => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetchGraphQL({
        query: MUTATIONS.updateCategory,
        variables: {
          input: { id: cat.id, name: form.name, description: form.description },
        },
      });
      if (!res.errors) {
        loadCategories();
        setEditing(null);
        setForm({ name: '', description: '' });
      } else {
        alert(res.errors[0].message);
      }
    } catch (e) {
      console.error('Update failed:', e);
    }
    setSaving(false);
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      const res = await fetchGraphQL({
        query: MUTATIONS.deleteCategory,
        variables: { input: { id: cat.id } },
      });
      if (!res.errors) {
        setCategories(categories.filter(c => c.categoryId !== cat.categoryId));
      } else {
        alert(res.errors[0].message);
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const startEdit = (cat: Category) => {
    setEditing(cat.categoryId);
    setForm({ name: cat.name, description: cat.description || '' });
    setCreating(false);
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ name: '', description: '' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setCreating(false);
    setForm({ name: '', description: '' });
  };

  return (
    <Stack gap="lg">
      <Group justify="between" align="center">
        <div>
          <Title order={2}>Categories</Title>
          <Text color="muted">{categories.length} categories</Text>
        </div>
        <Group gap="sm">
          <Button variant="outline" onClick={loadCategories} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button onClick={startCreate} disabled={creating}>
            <Plus size={16} />
            <span className="ml-2">New Category</span>
          </Button>
        </Group>
      </Group>

      {/* Create Form */}
      {creating && (
        <Card className="border-primary">
          <Stack gap="md">
            <Title order={5}>New Category</Title>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="Category name"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="Optional description"
              />
            </div>
            <Group justify="end" gap="sm">
              <Button variant="ghost" onClick={cancelEdit}>
                <X size={16} />
                <span className="ml-1">Cancel</span>
              </Button>
              <Button onClick={handleCreate} disabled={saving || !form.name.trim()}>
                <Check size={16} />
                <span className="ml-1">{saving ? 'Saving...' : 'Create'}</span>
              </Button>
            </Group>
          </Stack>
        </Card>
      )}

      {loading ? (
        <Card>
          <Text color="muted" className="text-center py-8">Loading...</Text>
        </Card>
      ) : categories.length === 0 && !creating ? (
        <Card>
          <Stack gap="md" className="text-center py-8">
            <Text color="muted">No categories found</Text>
            <Button onClick={startCreate}>Create your first category</Button>
          </Stack>
        </Card>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <Card key={cat.categoryId}>
              {editing === cat.categoryId ? (
                <Stack gap="md">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <Group justify="end" gap="sm">
                    <Button variant="ghost" onClick={cancelEdit}>
                      <X size={16} />
                    </Button>
                    <Button onClick={() => handleUpdate(cat)} disabled={saving}>
                      <Check size={16} />
                    </Button>
                  </Group>
                </Stack>
              ) : (
                <Group justify="between" align="center">
                  <Stack gap="xs">
                    <Group gap="sm" align="center">
                      <Text fw="medium">{cat.name}</Text>
                      {cat.count !== undefined && (
                        <Text size="xs" color="muted">({cat.count} posts)</Text>
                      )}
                    </Group>
                    {cat.description && (
                      <Text size="sm" color="muted">{cat.description}</Text>
                    )}
                    <Text size="xs" color="muted">/{cat.slug}</Text>
                  </Stack>
                  <Group gap="xs">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(cat)}>
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(cat)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </Group>
                </Group>
              )}
            </Card>
          ))}
        </div>
      )}
    </Stack>
  );
}

