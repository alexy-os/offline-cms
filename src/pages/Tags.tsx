import { useEffect, useState } from 'react';
import { Button, Card, Group, Stack, Text, Title } from '@ui8kit/core';
import { Plus, Edit, Trash2, RefreshCw, X, Check } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphql';
import { QUERIES, MUTATIONS } from '@/lib/mutations';

type Tag = {
  tagId: number;
  id: string;
  name: string;
  slug: string;
  count?: number;
};

export function TagsList() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [saving, setSaving] = useState(false);

  const loadTags = async () => {
    setLoading(true);
    try {
      const res = await fetchGraphQL<{ tags: { nodes: Tag[] } }>({
        query: QUERIES.tags,
      });
      if (res.data?.tags?.nodes) {
        setTags(res.data.tags.nodes);
      }
    } catch (e) {
      console.error('Failed to load tags:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetchGraphQL({
        query: MUTATIONS.createTag,
        variables: { input: { name: form.name } },
      });
      if (!res.errors) {
        loadTags();
        setCreating(false);
        setForm({ name: '' });
      } else {
        alert(res.errors[0].message);
      }
    } catch (e) {
      console.error('Create failed:', e);
    }
    setSaving(false);
  };

  const handleUpdate = async (tag: Tag) => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetchGraphQL({
        query: MUTATIONS.updateTag,
        variables: { input: { id: tag.id, name: form.name } },
      });
      if (!res.errors) {
        loadTags();
        setEditing(null);
        setForm({ name: '' });
      } else {
        alert(res.errors[0].message);
      }
    } catch (e) {
      console.error('Update failed:', e);
    }
    setSaving(false);
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`Delete tag "${tag.name}"?`)) return;
    try {
      const res = await fetchGraphQL({
        query: MUTATIONS.deleteTag,
        variables: { input: { id: tag.id } },
      });
      if (!res.errors) {
        setTags(tags.filter(t => t.tagId !== tag.tagId));
      } else {
        alert(res.errors[0].message);
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditing(tag.tagId);
    setForm({ name: tag.name });
    setCreating(false);
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ name: '' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setCreating(false);
    setForm({ name: '' });
  };

  return (
    <Stack gap="lg">
      <Group justify="between" align="center">
        <div>
          <Title order={2}>Tags</Title>
          <Text color="muted">{tags.length} tags</Text>
        </div>
        <Group gap="sm">
          <Button variant="outline" onClick={loadTags} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button onClick={startCreate} disabled={creating}>
            <Plus size={16} />
            <span className="ml-2">New Tag</span>
          </Button>
        </Group>
      </Group>

      {/* Create Form */}
      {creating && (
        <Card className="border-primary">
          <Stack gap="md">
            <Title order={5}>New Tag</Title>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="Tag name"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
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
      ) : tags.length === 0 && !creating ? (
        <Card>
          <Stack gap="md" className="text-center py-8">
            <Text color="muted">No tags found</Text>
            <Button onClick={startCreate}>Create your first tag</Button>
          </Stack>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Card key={tag.tagId} className="inline-flex">
              {editing === tag.tagId ? (
                <Group gap="sm">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ name: e.target.value })}
                    className="px-2 py-1 border border-border rounded bg-background w-32"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(tag)}
                  />
                  <Button variant="ghost" size="icon" onClick={cancelEdit}>
                    <X size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleUpdate(tag)} disabled={saving}>
                    <Check size={14} />
                  </Button>
                </Group>
              ) : (
                <Group gap="sm" align="center">
                  <Text fw="medium">{tag.name}</Text>
                  {tag.count !== undefined && (
                    <Text size="xs" color="muted">({tag.count})</Text>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => startEdit(tag)} className="h-6 w-6">
                    <Edit size={12} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(tag)}
                    className="h-6 w-6 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={12} />
                  </Button>
                </Group>
              )}
            </Card>
          ))}
        </div>
      )}
    </Stack>
  );
}

