import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/providers/theme';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Dashboard } from '@/pages/Dashboard';
import { PostsList } from '@/pages/Posts';
import { PostEditor } from '@/pages/PostEditor';
import { PagesList } from '@/pages/Pages';
import { PageEditor } from '@/pages/PageEditor';
import { CategoriesList } from '@/pages/Categories';
import { TagsList } from '@/pages/Tags';
import { Settings } from '@/pages/Settings';

// LesseUI Theme
export const lesseUITheme = {
  name: "LesseUI",
  rounded: {
    default: "lg" as const,
    button: "lg" as const,
    badge: "full" as const
  },
  buttonSize: {
    default: "sm" as const,
    badge: "sm" as const
  },
  isNavFixed: true
} as const;

function App() {
  return (
    <ThemeProvider theme={lesseUITheme}>
      <BrowserRouter>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/posts" element={<PostsList />} />
            <Route path="/posts/:id" element={<PostEditor />} />
            <Route path="/pages" element={<PagesList />} />
            <Route path="/pages/:id" element={<PageEditor />} />
            <Route path="/categories" element={<CategoriesList />} />
            <Route path="/tags" element={<TagsList />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App 