import { useEffect, useState } from 'react';
import { Button, Card, Group, Stack, Text, Title } from '@ui8kit/core';
import { RefreshCw, Check, AlertCircle, Cloud, CloudOff } from 'lucide-react';
import { fetchApiHealth, syncLocalDatabase, flushMutationQueue, getQueuedMutations } from '@/lib/graphql';

export function Settings() {
  const [health, setHealth] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [flushing, setFlushing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const [h, q] = await Promise.all([
        fetchApiHealth(),
        getQueuedMutations(),
      ]);
      setHealth(h);
      setQueue(q.mutations || []);
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const result = await syncLocalDatabase();
      setMessage({ type: 'success', text: `Synced: ${result.counts?.posts || 0} posts, ${result.counts?.pages || 0} pages` });
      loadData();
    } catch (e) {
      setMessage({ type: 'error', text: 'Sync failed' });
    }
    setSyncing(false);
  };

  const handleFlush = async () => {
    setFlushing(true);
    setMessage(null);
    try {
      const result = await flushMutationQueue();
      setMessage({ type: 'success', text: `Flushed ${result.flushed} mutations` });
      loadData();
    } catch (e) {
      setMessage({ type: 'error', text: 'Flush failed' });
    }
    setFlushing(false);
  };

  const isOnline = health?.upstream === 'configured';

  return (
    <Stack gap="lg">
      <Title order={2}>Settings</Title>

      {message && (
        <Card className={`border-l-4 ${
          message.type === 'success' ? 'border-l-green-500 bg-green-500/5' : 'border-l-red-500 bg-red-500/5'
        }`}>
          <Group gap="sm" align="center">
            {message.type === 'success' ? <Check size={18} className="text-green-500" /> : <AlertCircle size={18} className="text-red-500" />}
            <Text>{message.text}</Text>
          </Group>
        </Card>
      )}

      {/* API Status */}
      <Card>
        <Stack gap="md">
          <Title order={4}>API Status</Title>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text size="sm" color="muted">Mode</Text>
              <Text fw="medium" className={
                health?.mode === 'GETMODE' ? 'text-yellow-600' :
                health?.mode === 'SETMODE' ? 'text-green-600' :
                'text-blue-600'
              }>
                {health?.mode || 'Unknown'}
              </Text>
            </div>
            
            <div>
              <Text size="sm" color="muted">Connection</Text>
              <Group gap="sm" align="center">
                {isOnline ? <Cloud size={16} className="text-green-500" /> : <CloudOff size={16} className="text-yellow-500" />}
                <Text fw="medium">{isOnline ? 'Online' : 'Offline'}</Text>
              </Group>
            </div>
            
            <div>
              <Text size="sm" color="muted">Auth Token</Text>
              <Text fw="medium" className={health?.authToken === 'configured' ? 'text-green-600' : 'text-red-600'}>
                {health?.authToken === 'configured' ? 'Configured' : 'Missing'}
              </Text>
            </div>
            
            <div>
              <Text size="sm" color="muted">Port</Text>
              <Text fw="medium">{health?.port || '-'}</Text>
            </div>
          </div>
        </Stack>
      </Card>

      {/* Local Data */}
      <Card>
        <Stack gap="md">
          <Group justify="between" align="center">
            <Title order={4}>Local Database</Title>
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              <span className="ml-2">{syncing ? 'Syncing...' : 'Sync from Upstream'}</span>
            </Button>
          </Group>
          
          {health?.localData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Text size="2xl" fw="bold">{health.localData.posts}</Text>
                <Text size="sm" color="muted">Posts</Text>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Text size="2xl" fw="bold">{health.localData.pages}</Text>
                <Text size="sm" color="muted">Pages</Text>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Text size="2xl" fw="bold">{health.localData.categories}</Text>
                <Text size="sm" color="muted">Categories</Text>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Text size="2xl" fw="bold">{health.localData.tags}</Text>
                <Text size="sm" color="muted">Tags</Text>
              </div>
            </div>
          )}
          
          {health?.localData?.lastUpdated && (
            <Text size="sm" color="muted">
              Last updated: {new Date(health.localData.lastUpdated).toLocaleString()}
            </Text>
          )}
        </Stack>
      </Card>

      {/* Mutation Queue */}
      <Card>
        <Stack gap="md">
          <Group justify="between" align="center">
            <div>
              <Title order={4}>Mutation Queue</Title>
              <Text size="sm" color="muted">
                {queue.length === 0 ? 'No pending mutations' : `${queue.length} pending mutations`}
              </Text>
            </div>
            {queue.length > 0 && (
              <Button variant="secondary" size="sm" onClick={handleFlush} disabled={flushing || !isOnline}>
                <span>{flushing ? 'Flushing...' : 'Flush Queue'}</span>
              </Button>
            )}
          </Group>
          
          {queue.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {queue.map((mutation: any) => (
                <div key={mutation.id} className="p-2 bg-muted/30 rounded text-sm font-mono">
                  <Text size="xs" color="muted">{mutation.createdAt}</Text>
                  <Text size="xs" className="truncate">{mutation.payload?.query?.slice(0, 100)}...</Text>
                </div>
              ))}
            </div>
          )}
        </Stack>
      </Card>

      {/* Mode Explanation */}
      <Card className="bg-muted/30">
        <Stack gap="sm">
          <Title order={5}>Mode Reference</Title>
          <div className="space-y-2 text-sm">
            <div>
              <Text fw="medium" className="text-yellow-600">GETMODE</Text>
              <Text color="muted">Read-only. Mutations are blocked.</Text>
            </div>
            <div>
              <Text fw="medium" className="text-green-600">SETMODE</Text>
              <Text color="muted">Edit mode. Mutations execute or queue when offline.</Text>
            </div>
            <div>
              <Text fw="medium" className="text-blue-600">CRUDMODE</Text>
              <Text color="muted">Full bidirectional sync (future).</Text>
            </div>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}

