import { NavLink, Outlet } from 'react-router-dom';
import { Block, Button, Group, Stack, Text, Title } from '@ui8kit/core';
import { useTheme } from '@/providers/theme';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Tags, 
  FileStack,
  Settings,
  RefreshCw,
  Moon,
  Sun,
  CloudOff,
  Cloud
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchApiHealth, syncLocalDatabase, flushMutationQueue } from '@/lib/graphql';

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/posts', label: 'Posts', icon: <FileText size={18} /> },
  { to: '/pages', label: 'Pages', icon: <FileStack size={18} /> },
  { to: '/categories', label: 'Categories', icon: <FolderOpen size={18} /> },
  { to: '/tags', label: 'Tags', icon: <Tags size={18} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
];

export function AdminLayout() {
  const { toggleDarkMode, isDarkMode } = useTheme();
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [flushing, setFlushing] = useState(false);

  useEffect(() => {
    fetchApiHealth().then(setApiStatus).catch(() => setApiStatus(null));
    const interval = setInterval(() => {
      fetchApiHealth().then(setApiStatus).catch(() => setApiStatus(null));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncLocalDatabase();
      const status = await fetchApiHealth();
      setApiStatus(status);
    } catch (e) {
      console.error('Sync failed:', e);
    }
    setSyncing(false);
  };

  const handleFlush = async () => {
    setFlushing(true);
    try {
      await flushMutationQueue();
      const status = await fetchApiHealth();
      setApiStatus(status);
    } catch (e) {
      console.error('Flush failed:', e);
    }
    setFlushing(false);
  };

  const isOnline = apiStatus?.upstream === 'configured';
  const queueCount = apiStatus?.queuedMutations || 0;

  return (
    <Block className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <Block 
        component="aside" 
        className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border flex flex-col"
      >
        {/* Logo */}
        <Block p="md" className="border-b border-border">
          <Title order={4}>CMS Admin</Title>
          <Text size="xs" color="muted">
            Mode: <strong>{apiStatus?.mode || 'GETMODE'}</strong>
          </Text>
        </Block>

        {/* Navigation */}
        <Stack gap="xs" p="sm" className="flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </Stack>

        {/* Status & Actions */}
        <Stack gap="sm" p="sm" className="border-t border-border">
          {/* Connection Status */}
          <Group gap="sm" align="center">
            {isOnline ? (
              <Cloud size={16} className="text-green-500" />
            ) : (
              <CloudOff size={16} className="text-yellow-500" />
            )}
            <Text size="xs" color={isOnline ? 'success' : 'warning'}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            {queueCount > 0 && (
              <Text size="xs" color="warning" className="ml-auto">
                {queueCount} queued
              </Text>
            )}
          </Group>

          {/* Sync Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSync}
            disabled={syncing}
            className="w-full"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span className="ml-2">{syncing ? 'Syncing...' : 'Sync Data'}</span>
          </Button>

          {/* Flush Queue (if SETMODE and has queued) */}
          {apiStatus?.mode === 'SETMODE' && queueCount > 0 && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleFlush}
              disabled={flushing}
              className="w-full"
            >
              <span>{flushing ? 'Flushing...' : `Flush Queue (${queueCount})`}</span>
            </Button>
          )}
        </Stack>
      </Block>

      {/* Main Content */}
      <Block className="ml-64">
        {/* Header */}
        <Block 
          component="header" 
          className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border"
          px="lg"
          py="sm"
        >
          <Group justify="end" align="center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </Group>
        </Block>

        {/* Page Content */}
        <Block p="lg">
          <Outlet />
        </Block>
      </Block>
    </Block>
  );
}

