// WPGraphQL Mutations for CRUD operations

export const MUTATIONS = {
  // Posts
  createPost: `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        post {
          postId
          id
          title
          content
          excerpt
          slug
          date
          status
        }
      }
    }
  `,
  
  updatePost: `
    mutation UpdatePost($input: UpdatePostInput!) {
      updatePost(input: $input) {
        post {
          postId
          id
          title
          content
          excerpt
          slug
          date
          status
        }
      }
    }
  `,
  
  deletePost: `
    mutation DeletePost($input: DeletePostInput!) {
      deletePost(input: $input) {
        deletedId
        post {
          postId
          id
          title
        }
      }
    }
  `,
  
  // Pages
  createPage: `
    mutation CreatePage($input: CreatePageInput!) {
      createPage(input: $input) {
        page {
          pageId
          id
          title
          content
          slug
          status
        }
      }
    }
  `,
  
  updatePage: `
    mutation UpdatePage($input: UpdatePageInput!) {
      updatePage(input: $input) {
        page {
          pageId
          id
          title
          content
          slug
          status
        }
      }
    }
  `,
  
  deletePage: `
    mutation DeletePage($input: DeletePageInput!) {
      deletePage(input: $input) {
        deletedId
        page {
          pageId
          id
          title
        }
      }
    }
  `,
  
  // Categories
  createCategory: `
    mutation CreateCategory($input: CreateCategoryInput!) {
      createCategory(input: $input) {
        category {
          categoryId
          id
          name
          slug
          description
        }
      }
    }
  `,
  
  updateCategory: `
    mutation UpdateCategory($input: UpdateCategoryInput!) {
      updateCategory(input: $input) {
        category {
          categoryId
          id
          name
          slug
          description
        }
      }
    }
  `,
  
  deleteCategory: `
    mutation DeleteCategory($input: DeleteCategoryInput!) {
      deleteCategory(input: $input) {
        deletedId
        category {
          categoryId
          id
          name
        }
      }
    }
  `,
  
  // Tags
  createTag: `
    mutation CreateTag($input: CreateTagInput!) {
      createTag(input: $input) {
        tag {
          tagId
          id
          name
          slug
        }
      }
    }
  `,
  
  updateTag: `
    mutation UpdateTag($input: UpdateTagInput!) {
      updateTag(input: $input) {
        tag {
          tagId
          id
          name
          slug
        }
      }
    }
  `,
  
  deleteTag: `
    mutation DeleteTag($input: DeleteTagInput!) {
      deleteTag(input: $input) {
        deletedId
        tag {
          tagId
          id
          name
        }
      }
    }
  `,
};

export const QUERIES = {
  posts: `
    query GetPosts($first: Int = 50) {
      posts(first: $first) {
        nodes {
          postId
          id
          title
          excerpt
          slug
          date
          status
          author {
            node {
              name
            }
          }
          categories {
            nodes {
              name
              slug
            }
          }
        }
      }
    }
  `,
  
  post: `
    query GetPost($id: ID!) {
      post(id: $id, idType: DATABASE_ID) {
        postId
        id
        title
        content
        excerpt
        slug
        date
        status
      }
    }
  `,
  
  pages: `
    query GetPages($first: Int = 50) {
      pages(first: $first) {
        nodes {
          pageId
          id
          title
          slug
          status
        }
      }
    }
  `,
  
  page: `
    query GetPage($id: ID!) {
      page(id: $id, idType: DATABASE_ID) {
        pageId
        id
        title
        content
        slug
        status
      }
    }
  `,
  
  categories: `
    query GetCategories {
      categories(first: 100) {
        nodes {
          categoryId
          id
          name
          slug
          description
          count
        }
      }
    }
  `,
  
  tags: `
    query GetTags {
      tags(first: 100) {
        nodes {
          tagId
          id
          name
          slug
          count
        }
      }
    }
  `,
};

