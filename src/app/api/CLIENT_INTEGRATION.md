# API Client Integration Guide

Quick guide for integrating with the Lead Pilot REST API.

## Table of Contents
1. [Setup](#setup)
2. [Basic Usage](#basic-usage)
3. [React Hooks](#react-hooks)
4. [Redux Integration](#redux-integration)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

---

## Setup

### Environment Configuration

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Client Instance

Create `src/lib/apiClient.ts`:
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
```

---

## Basic Usage

### Fetch Data

```typescript
import apiClient from '@/lib/apiClient';

// Get all leads with pagination
const fetchLeads = async (page = 1, limit = 10) => {
  const response = await apiClient.get('/leads', {
    params: { page, limit }
  });
  return response.data;
};

// Get single lead
const fetchLead = async (id: string) => {
  const response = await apiClient.get(`/leads/${id}`);
  return response.data;
};
```

### Create Data

```typescript
// Create new lead
const createLead = async (leadData) => {
  const response = await apiClient.post('/leads', leadData);
  return response.data;
};

// Create multiple leads
const bulkCreateLeads = async (leads) => {
  const response = await apiClient.post('/leads/bulk/create', { leads });
  return response.data;
};
```

### Update Data

```typescript
// Update lead
const updateLead = async (id: string, updates) => {
  const response = await apiClient.put(`/leads/${id}`, updates);
  return response.data;
};
```

### Delete Data

```typescript
// Delete lead
const deleteLead = async (id: string) => {
  const response = await apiClient.delete(`/leads/${id}`);
  return response.data;
};
```

---

## React Hooks

### Custom Hook: useFetch

```typescript
// src/hooks/useFetch.ts
import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await apiClient.get(url);
        if (mounted) {
          setState({ data: response.data.data, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({ data: null, loading: false, error: error as Error });
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [url]);

  return state;
}
```

### Custom Hook: useCreateLead

```typescript
// src/hooks/useCreateLead.ts
import { useState } from 'react';
import apiClient from '@/lib/apiClient';

export function useCreateLead() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (leadData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/leads', leadData);
      return response.data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}
```

### Using Hooks in Components

```typescript
// src/components/LeadsList.tsx
import { useFetch } from '@/hooks/useFetch';

export function LeadsList() {
  const { data: response, loading, error } = useFetch('/leads?page=1&limit=10');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {response?.data?.map((lead) => (
        <div key={lead.id}>{lead.name}</div>
      ))}
    </div>
  );
}
```

---

## Redux Integration

### Setup Redux Slice

```typescript
// src/redux/features/leads/leadsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/apiClient';

export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (params: { page?: number; limit?: number } = {}) => {
    const response = await apiClient.get('/leads', { params });
    return response.data;
  }
);

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData: any) => {
    const response = await apiClient.post('/leads', leadData);
    return response.data;
  }
);

const leadsSlice = createSlice({
  name: 'leads',
  initialState: {
    items: [],
    loading: false,
    error: null,
    total: 0,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.items = action.payload.data;
        state.total = action.payload.pagination?.total || 0;
        state.loading = false;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export default leadsSlice.reducer;
```

### Use in Component

```typescript
// src/components/LeadsPage.tsx
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads } from '@/redux/features/leads/leadsSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

export function LeadsPage() {
  const dispatch = useAppDispatch();
  const { items: leads, loading } = useAppSelector(state => state.leads);

  useEffect(() => {
    dispatch(fetchLeads({ page: 1, limit: 10 }));
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {leads.map((lead) => (
        <div key={lead.id}>{lead.name}</div>
      ))}
    </div>
  );
}
```

---

## Error Handling

### API Error Types

```typescript
// src/lib/apiErrors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
  }
}

export class ValidationError extends ApiError {}
export class NotFoundError extends ApiError {}
export class UnauthorizedError extends ApiError {}
export class ForbiddenError extends ApiError {}
```

### Error Interceptor

```typescript
// Add to apiClient.ts
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data.message || 'An error occurred';
      const errors = data.errors || null;

      switch (status) {
        case 400:
          throw new ValidationError(status, message, errors);
        case 401:
          throw new UnauthorizedError(status, 'Please log in');
        case 403:
          throw new ForbiddenError(status, 'Access denied');
        case 404:
          throw new NotFoundError(status, 'Not found');
        default:
          throw new ApiError(status, message);
      }
    }
    throw error;
  }
);
```

### Handling Errors in Components

```typescript
// src/components/CreateLeadForm.tsx
import { useState } from 'react';
import { useCreateLead } from '@/hooks/useCreateLead';
import { ValidationError } from '@/lib/apiErrors';

export function CreateLeadForm() {
  const { create, loading, error } = useCreateLead();
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (formData) => {
    try {
      setFormErrors({});
      await create(formData);
      // Success - redirect or show toast
    } catch (err) {
      if (err instanceof ValidationError && err.errors) {
        setFormErrors(err.errors);
      } else {
        console.error('Error:', err);
      }
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.currentTarget));
    }}>
      {/* Form fields */}
      {error && <div className="error">{error.message}</div>}
      <button disabled={loading}>Create Lead</button>
    </form>
  );
}
```

---

## Best Practices

### 1. Always Handle Loading and Error States

```typescript
export function UserProfile() {
  const { data, loading, error } = useFetch('/users');

  if (loading) return <Skeleton />;
  if (error) return <ErrorAlert message={error.message} />;
  if (!data) return <div>No data</div>;

  return <div>{data.name}</div>;
}
```

### 2. Use Pagination

```typescript
// Fetch with pagination
const [page, setPage] = useState(1);
const { data } = useFetch(`/leads?page=${page}&limit=10`);

// Show pagination controls
<Pagination
  current={page}
  total={data?.pagination?.totalPages}
  onPageChange={setPage}
/>
```

### 3. Debounce Search Requests

```typescript
import { useDebouncedCallback } from 'use-debounce';

export function SearchLeads() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedCallback(
    (query) => {
      // Fetch with query
    },
    500
  );

  return (
    <input
      onChange={(e) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
      }}
    />
  );
}
```

### 4. Cache Responses

```typescript
// Using React Query (recommended)
import { useQuery } from '@tanstack/react-query';

export function useLeads(page: number) {
  return useQuery({
    queryKey: ['leads', page],
    queryFn: () => apiClient.get(`/leads?page=${page}`).then(r => r.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### 5. Optimistic Updates

```typescript
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.put(`/leads/${data.id}`, data),
    onMutate: async (updatedLead) => {
      // Optimistically update cache
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData(['leads']);
      
      queryClient.setQueryData(['leads'], (old: any) => ({
        ...old,
        data: old.data.map(lead => 
          lead.id === updatedLead.id ? updatedLead : lead
        )
      }));

      return { previousLeads };
    },
    onError: (err, newData, context) => {
      // Revert on error
      queryClient.setQueryData(['leads'], context?.previousLeads);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
```

### 6. Rate Limiting

```typescript
// Use axios-rate-limit
import rateLimit from 'axios-rate-limit';

const limitedClient = rateLimit(apiClient, {
  maxRequests: 100,
  windowMs: 60 * 1000, // Per minute
});
```

---

## Example: Complete Lead Management Module

```typescript
// src/hooks/useLeadsManager.ts
import { useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

interface UseleadsManagerOptions {
  page?: number;
  limit?: number;
}

export function useLeadsManager(options: UseleadsManagerOptions = {}) {
  const { page = 1, limit = 10 } = options;
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/leads', {
        params: { page, limit }
      });
      setLeads(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const createLead = useCallback(async (leadData) => {
    try {
      const response = await apiClient.post('/leads', leadData);
      setLeads([response.data.data, ...leads]);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [leads]);

  const updateLead = useCallback(async (id: string, updates) => {
    try {
      const response = await apiClient.put(`/leads/${id}`, updates);
      setLeads(leads.map(lead => 
        lead.id === id ? response.data.data : lead
      ));
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [leads]);

  const deleteLead = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/leads/${id}`);
      setLeads(leads.filter(lead => lead.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [leads]);

  return {
    leads,
    pagination,
    loading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
  };
}
```

---

## Testing

### Mock API Responses

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/leads', () => {
    return HttpResponse.json({
      success: true,
      data: [{ id: '1', name: 'John Doe', email: 'john@example.com' }],
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1 }
    });
  }),
];
```

### Setup MSW

```typescript
// src/test/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Common Patterns

### Infinite Scroll

```typescript
export function InfiniteLeadsList() {
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(1);
  const { data, loading } = useFetch(`/leads?page=${page}&limit=20`);

  const observerTarget = useRef(null);

  useEffect(() => {
    if (data?.data) {
      setLeads(prev => [...prev, ...data.data]);
    }
  }, [data]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPage(prev => prev + 1);
      }
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {leads.map(lead => <div key={lead.id}>{lead.name}</div>)}
      <div ref={observerTarget}>{loading && <div>Loading...</div>}</div>
    </div>
  );
}
```

---

## Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Backend README](../backend/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Axios Documentation](https://axios-http.com/)
- [React Query](https://tanstack.com/query/latest)
