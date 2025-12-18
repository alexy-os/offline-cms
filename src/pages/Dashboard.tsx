import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Block, Button, Card, Group, Stack, Text, Title } from '@ui8kit/core';
import { FileText, FolderOpen, Tags, FileStack, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchApiHealth, getLocalData } from '@/lib/graphql';

type Stats = {
  posts: number;
  categories: number;
  tags: number;
  pages: number;
  lastUpdated?: string;
};

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [apiHealth, setApiHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [health, local] = await Promise.all([
      fetchApiHealth(),
      getLocalData(),
    ]);
    setApiHealth(health);
    
    if (local.data) {
      setStats({
        posts: local.data.posts?.length || 0,
        categories: local.data.categories?.length || 0,
        tags: local.data.tags?.length || 0,
        pages: local.data.pages?.length || 0,
        lastUpdated: local.data.lastUpdated,
      });
    } else if (health.localData) {
      setStats(health.localData);
    } else {
      // Offline mode - show zeros
      setStats({ posts: 0, categories: 0, tags: 0, pages: 0 });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const statCards = [
    { label: 'Posts', value: stats?.posts || 0, icon: <FileText size={24} />, to: '/posts', color: 'text-blue-500' },
    { label: 'Pages', value: stats?.pages || 0, icon: <FileStack size={24} />, to: '/pages', color: 'text-purple-500' },
    { label: 'Categories', value: stats?.categories || 0, icon: <FolderOpen size={24} />, to: '/categories', color: 'text-green-500' },
    { label: 'Tags', value: stats?.tags || 0, icon: <Tags size={24} />, to: '/tags', color: 'text-orange-500' },
  ];

  return (
    <Stack gap="lg">
      <Group justify="between" align="center">
        <div>
          <Title order={2}>Dashboard</Title>
          <Text color="muted">Overview of your content</Text>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="ml-2">Refresh</span>
        </Button>
      </Group>

      {/* API Status Alert */}
      {apiHealth && (
        <Card className={`border-l-4 ${
          apiHealth.status === 'offline' ? 'border-l-gray-500 bg-gray-500/5' :
          apiHealth.mode === 'GETMODE' ? 'border-l-yellow-500 bg-yellow-500/5' :
          apiHealth.mode === 'SETMODE' ? 'border-l-green-500 bg-green-500/5' :
          'border-l-blue-500 bg-blue-500/5'
        }`}>
          <Group gap="md" align="center">
            <AlertCircle size={20} className={
              apiHealth.status === 'offline' ? 'text-gray-500' :
              apiHealth.mode === 'GETMODE' ? 'text-yellow-500' :
              apiHealth.mode === 'SETMODE' ? 'text-green-500' :
              'text-blue-500'
            } />
            <div>
              <Text fw="medium">
                {apiHealth.status === 'offline' && 'Offline Mode'}
                {apiHealth.mode === 'GETMODE' && 'Read-Only Mode'}
                {apiHealth.mode === 'SETMODE' && 'Edit Mode (SETMODE)'}
                {apiHealth.mode === 'CRUDMODE' && 'Full CRUD Mode'}
              </Text>
              <Text size="sm" color="muted">
                {apiHealth.status === 'offline' && 'API server not available. Working in offline mode - changes will be saved locally.'}
                {apiHealth.mode === 'GETMODE' && 'Mutations are blocked. Change GRAPHQL_MODE to SETMODE in apps/api to enable editing.'}
                {apiHealth.mode === 'SETMODE' && 'You can create, edit, and delete content. Changes sync to WordPress.'}
                {apiHealth.mode === 'CRUDMODE' && 'Full bidirectional sync enabled.'}
              </Text>
            </div>
          </Group>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} to={card.to}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <Group justify="between" align="start">
                <div>
                  <Text size="sm" color="muted">{card.label}</Text>
                  <Title order={2} className="mt-1">{card.value}</Title>
                </div>
                <Block className={card.color}>{card.icon}</Block>
              </Group>
            </Card>
          </Link>
        ))}
      </div>

      {/* Last Updated */}
      {stats?.lastUpdated && (
        <Text size="sm" color="muted" className="text-center">
          Last synced: {new Date(stats.lastUpdated).toLocaleString()}
        </Text>
      )}

      {/* Queued Mutations */}
      {apiHealth?.queuedMutations > 0 && (
        <Card className="border-l-4 border-l-orange-500 bg-orange-500/5">
          <Group gap="md" align="center">
            <AlertCircle size={20} className="text-orange-500" />
            <div>
              <Text fw="medium">
                {apiHealth.queuedMutations} Pending Changes
              </Text>
              <Text size="sm" color="muted">
                These changes are queued and will sync when the connection is restored.
              </Text>
            </div>
          </Group>
        </Card>
      )}
    </Stack>
  );
}

