import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Group, Stack, Text, Title } from '@ui8kit/core';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphql';
import { QUERIES, MUTATIONS } from '@/lib/mutations';

type Post = {
  postId: number;
  id: string;
  title: string;
  excerpt?: string;
  slug: string;
  date: string;
  status: string;
  author?: { node?: { name: string } };
  categories?: { nodes: Array<{ name: string; slug: string }> };
};

export function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetchGraphQL<{ posts: { nodes: Post[] } }>({
        query: QUERIES.posts,
      });
      if (res.data?.posts?.nodes) {
        setPosts(res.data.posts.nodes);
      }
    } catch (e) {
      console.error('Failed to load posts:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (post: Post) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;
    
    setDeleting(post.postId);
    try {
      const res = await fetchGraphQL({
        query: MUTATIONS.deletePost,
        variables: { input: { id: post.id } },
      });
      
      if (res.errors) {
        alert(`Failed to delete: ${res.errors[0].message}`);
      } else if (res.extensions?.queued) {
        alert('Delete queued for when connection is restored.');
        setPosts(posts.filter(p => p.postId !== post.postId));
      } else {
        setPosts(posts.filter(p => p.postId !== post.postId));
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
          <Title order={2}>Posts</Title>
          <Text color="muted">{posts.length} posts</Text>
        </div>
        <Group gap="sm">
          <Button variant="outline" onClick={loadPosts} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button onClick={() => navigate('/posts/new')}>
            <Plus size={16} />
            <span className="ml-2">New Post</span>
          </Button>
        </Group>
      </Group>

      {loading ? (
        <Card>
          <Text color="muted" className="text-center py-8">Loading posts...</Text>
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <Stack gap="md" className="text-center py-8">
            <Text color="muted">No posts found</Text>
            <Button onClick={() => navigate('/posts/new')}>Create your first post</Button>
          </Stack>
        </Card>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Card key={post.postId} className="hover:border-primary/50 transition-colors">
              <Group justify="between" align="start">
                <Stack gap="xs" className="flex-1">
                  <Group gap="sm" align="center">
                    <Title order={5}>{post.title || '(Untitled)'}</Title>
                    <Text size="xs" className={`px-2 py-0.5 rounded ${
                      post.status === 'publish' ? 'bg-green-500/10 text-green-600' :
                      post.status === 'draft' ? 'bg-yellow-500/10 text-yellow-600' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {post.status}
                    </Text>
                  </Group>
                  <Group gap="md">
                    <Text size="sm" color="muted">
                      {new Date(post.date).toLocaleDateString()}
                    </Text>
                    {post.author?.node?.name && (
                      <Text size="sm" color="muted">by {post.author.node.name}</Text>
                    )}
                    {post.categories?.nodes && post.categories.nodes.length > 0 && (
                      <Text size="sm" color="muted">
                        in {post.categories.nodes.map(c => c.name).join(', ')}
                      </Text>
                    )}
                  </Group>
                </Stack>
                <Group gap="xs">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => navigate(`/posts/${post.postId}`)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(post)}
                    disabled={deleting === post.postId}
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

