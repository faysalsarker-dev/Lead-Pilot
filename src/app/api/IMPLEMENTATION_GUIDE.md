# Backend Implementation Guide

Complete guide for implementing the API routes with proper error handling, validation, and response formatting.

## Table of Contents
1. [Route Structure](#route-structure)
2. [Pattern Overview](#pattern-overview)
3. [Common Patterns](#common-patterns)
4. [Complete Examples](#complete-examples)
5. [Error Handling](#error-handling)
6. [Testing](#testing)

---

## Route Structure

### Next.js App Router Structure

```
/src/app/api/
├── users/
│   ├── route.ts                  # GET /users, PUT /users
│   ├── settings/
│   │   └── route.ts              # GET /users/settings, PUT /users/settings
│   └── unread-count/
│       └── route.ts              # GET /users/unread-count
├── leads/
│   ├── route.ts                  # GET /leads, POST /leads
│   ├── [id]/
│   │   └── route.ts              # GET/PUT/DELETE /leads/:id
│   └── bulk/
│       └── create/
│           └── route.ts          # POST /leads/bulk/create
└── ... (more resources)
```

---

## Pattern Overview

### Basic Route Handler Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Import services, validators, response handlers
import { leadService } from '@/backend/services';
import { createLeadSchema } from '@/backend/validators';
import { createSuccessResponse, createErrorResponse } from '@/backend/middleware/response-handler';
import { ValidationError, NotFoundError } from '@/backend/middleware/errors';

export async function GET(request: NextRequest) {
  try {
    // 1. Get session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    // 2. Extract userId from session
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'User ID not found', 401),
        { status: 401 }
      );
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 4. Call service
    const result = await leadService.getLeads(userId, { page, limit });

    // 5. Return response
    return NextResponse.json(
      createSuccessResponse(result.data, 'Leads retrieved successfully', result.pagination),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to fetch leads', 500),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Get session and userId
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();

    // 3. Validate input
    const validation = createLeadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse(
          'Validation Error',
          'Invalid input',
          400,
          validation.error.flatten().fieldErrors
        ),
        { status: 400 }
      );
    }

    // 4. Call service
    const lead = await leadService.createLead(
      session.user.id,
      validation.data
    );

    // 5. Return response
    return NextResponse.json(
      createSuccessResponse(lead, 'Lead created successfully'),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        createErrorResponse('Validation Error', error.message, 400),
        { status: 400 }
      );
    }
    console.error('Error creating lead:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to create lead', 500),
      { status: 500 }
    );
  }
}
```

---

## Common Patterns

### Pattern 1: GET List with Pagination

```typescript
// /api/[resource]/route.ts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;

    const result = await resourceService.list(session.user.id, {
      page,
      limit,
      search,
      status,
    });

    return NextResponse.json(
      createSuccessResponse(result.data, 'Resources retrieved', result.pagination),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to fetch resources', 500),
      { status: 500 }
    );
  }
}
```

### Pattern 2: POST Create

```typescript
// /api/[resource]/route.ts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createResourceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse(
          'Validation Error',
          'Invalid input',
          400,
          validation.error.flatten().fieldErrors
        ),
        { status: 400 }
      );
    }

    const resource = await resourceService.create(
      session.user.id,
      validation.data
    );

    return NextResponse.json(
      createSuccessResponse(resource, 'Resource created'),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        createErrorResponse('Validation Error', error.message, 400),
        { status: 400 }
      );
    }
    console.error('Error creating resource:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to create resource', 500),
      { status: 500 }
    );
  }
}
```

### Pattern 3: GET Single Item

```typescript
// /api/[resource]/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    const resource = await resourceService.getById(params.id, session.user.id);

    if (!resource) {
      return NextResponse.json(
        createErrorResponse('Not Found', 'Resource not found', 404),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createSuccessResponse(resource, 'Resource retrieved'),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        createErrorResponse('Not Found', error.message, 404),
        { status: 404 }
      );
    }
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to fetch resource', 500),
      { status: 500 }
    );
  }
}
```

### Pattern 4: PUT Update

```typescript
// /api/[resource]/[id]/route.ts
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateResourceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse(
          'Validation Error',
          'Invalid input',
          400,
          validation.error.flatten().fieldErrors
        ),
        { status: 400 }
      );
    }

    const resource = await resourceService.update(
      params.id,
      validation.data,
      session.user.id
    );

    return NextResponse.json(
      createSuccessResponse(resource, 'Resource updated'),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        createErrorResponse('Not Found', error.message, 404),
        { status: 404 }
      );
    }
    if (error instanceof ValidationError) {
      return NextResponse.json(
        createErrorResponse('Validation Error', error.message, 400),
        { status: 400 }
      );
    }
    console.error('Error updating resource:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to update resource', 500),
      { status: 500 }
    );
  }
}
```

### Pattern 5: DELETE Resource

```typescript
// /api/[resource]/[id]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    const success = await resourceService.delete(params.id, session.user.id);

    if (!success) {
      return NextResponse.json(
        createErrorResponse('Not Found', 'Resource not found', 404),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createSuccessResponse(null, 'Resource deleted'),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        createErrorResponse('Not Found', error.message, 404),
        { status: 404 }
      );
    }
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to delete resource', 500),
      { status: 500 }
    );
  }
}
```

### Pattern 6: Custom Action (POST)

```typescript
// /api/campaigns/[id]/launch/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    const campaign = await campaignService.launch(params.id, session.user.id);

    return NextResponse.json(
      createSuccessResponse(campaign, 'Campaign launched successfully'),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        createErrorResponse('Not Found', error.message, 404),
        { status: 404 }
      );
    }
    if (error instanceof ValidationError) {
      return NextResponse.json(
        createErrorResponse('Validation Error', error.message, 400),
        { status: 400 }
      );
    }
    console.error('Error launching campaign:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to launch campaign', 500),
      { status: 500 }
    );
  }
}
```

### Pattern 7: Bulk Operations

```typescript
// /api/leads/bulk/create/route.ts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = bulkCreateLeadsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse(
          'Validation Error',
          'Invalid input',
          400,
          validation.error.flatten().fieldErrors
        ),
        { status: 400 }
      );
    }

    const result = await leadService.bulkCreate(
      session.user.id,
      validation.data.leads
    );

    return NextResponse.json(
      createSuccessResponse(result, 'Leads created successfully'),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        createErrorResponse('Validation Error', error.message, 400),
        { status: 400 }
      );
    }
    console.error('Error bulk creating leads:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to create leads', 500),
      { status: 500 }
    );
  }
}
```

---

## Complete Examples

### Example 1: Leads List Endpoint

```typescript
// /src/app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { leadService } from '@/backend/services';
import { listLeadsSchema, createLeadSchema } from '@/backend/validators';
import { createSuccessResponse, createErrorResponse } from '@/backend/middleware/response-handler';
import { ValidationError } from '@/backend/middleware/errors';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const isActive = searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined;
    const isInterested = searchParams.get('isInterested') ? searchParams.get('isInterested') === 'true' : undefined;
    const aiEnriched = searchParams.get('aiEnriched') ? searchParams.get('aiEnriched') === 'true' : undefined;

    const result = await leadService.getLeads(session.user.id, {
      page,
      limit,
      search,
      status,
      isActive,
      isInterested,
      aiEnriched,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Leads retrieved successfully',
        data: result.leads,
        pagination: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to fetch leads', 500),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createLeadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation error',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const lead = await leadService.createLead(session.user.id, validation.data);

    return NextResponse.json(
      {
        success: true,
        statusCode: 201,
        message: 'Lead created successfully',
        data: lead,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        createErrorResponse('Validation Error', error.message, 400),
        { status: 400 }
      );
    }
    console.error('Error creating lead:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to create lead', 500),
      { status: 500 }
    );
  }
}
```

### Example 2: Lead Update Endpoint

```typescript
// /src/app/api/leads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { leadService } from '@/backend/services';
import { updateLeadSchema } from '@/backend/validators';
import { createErrorResponse } from '@/backend/middleware/response-handler';
import { ValidationError, NotFoundError } from '@/backend/middleware/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    const lead = await leadService.getLeadById(params.id);

    if (!lead) {
      return NextResponse.json(
        createErrorResponse('Not Found', 'Lead not found', 404),
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Lead retrieved successfully',
        data: lead,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to fetch lead', 500),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateLeadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation error',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const lead = await leadService.updateLead(params.id, validation.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Lead updated successfully',
        data: lead,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        createErrorResponse('Not Found', 'Lead not found', 404),
        { status: 404 }
      );
    }
    console.error('Error updating lead:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to update lead', 500),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    const success = await leadService.deleteLead(params.id);

    if (!success) {
      return NextResponse.json(
        createErrorResponse('Not Found', 'Lead not found', 404),
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Lead deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to delete lead', 500),
      { status: 500 }
    );
  }
}
```

### Example 3: Campaign Launch Endpoint

```typescript
// /src/app/api/campaigns/[id]/launch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { campaignService } from '@/backend/services';
import { createErrorResponse } from '@/backend/middleware/response-handler';
import { ValidationError, NotFoundError } from '@/backend/middleware/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'Please log in', 401),
        { status: 401 }
      );
    }

    const campaign = await campaignService.launchCampaign(params.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Campaign launched successfully',
        data: campaign,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        createErrorResponse('Not Found', 'Campaign not found', 404),
        { status: 404 }
      );
    }
    if (error instanceof ValidationError) {
      return NextResponse.json(
        createErrorResponse('Validation Error', error.message, 400),
        { status: 400 }
      );
    }
    console.error('Error launching campaign:', error);
    return NextResponse.json(
      createErrorResponse('Internal Server Error', 'Failed to launch campaign', 500),
      { status: 500 }
    );
  }
}
```

---

## Error Handling

### Error Classes

All error classes are in `/src/backend/middleware/errors.ts`:

```typescript
import { ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError } from '@/backend/middleware/errors';
```

### Error Mapping

```typescript
const errorMapping = {
  ValidationError: { status: 400, message: 'Validation error' },
  NotFoundError: { status: 404, message: 'Not found' },
  UnauthorizedError: { status: 401, message: 'Unauthorized' },
  ForbiddenError: { status: 403, message: 'Forbidden' },
  ConflictError: { status: 409, message: 'Conflict' },
};

try {
  // ... service call
} catch (error) {
  if (error instanceof ValidationError) {
    return NextResponse.json(..., { status: 400 });
  }
  // ... handle other errors
}
```

### Logging Errors

```typescript
console.error('Error context:', {
  endpoint: '/api/leads',
  method: 'POST',
  userId: session?.user?.id,
  error: error instanceof Error ? error.message : 'Unknown error',
  stack: error instanceof Error ? error.stack : undefined,
});
```

---

## Testing

### Test Example with MSW

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/leads', () => {
    return HttpResponse.json(
      {
        success: true,
        data: [{ id: '1', name: 'John', email: 'john@example.com' }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      },
      { status: 200 }
    );
  }),

  http.post('/api/leads', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        success: true,
        statusCode: 201,
        message: 'Lead created',
        data: { id: '123', ...body },
      },
      { status: 201 }
    );
  }),
];
```

### Component Test

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadsPage } from '@/app/leads/page';
import { server } from '@/test/setup';

describe('LeadsPage', () => {
  it('renders leads list', async () => {
    render(<LeadsPage />);
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });
  });

  it('creates new lead', async () => {
    const user = userEvent.setup();
    render(<LeadsPage />);

    await user.click(screen.getByRole('button', { name: /create/i }));
    await user.type(screen.getByLabelText(/name/i), 'Jane');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });
  });
});
```

---

## Implementation Checklist

For each endpoint, ensure:

- [ ] Session extraction and authentication check
- [ ] Input validation using Zod schemas
- [ ] Service method invocation
- [ ] Error handling with proper status codes
- [ ] Response formatting using helper functions
- [ ] Console logging for debugging
- [ ] TypeScript types for params and response
- [ ] Query parameter parsing and validation
- [ ] Pagination limit constraints (min: 1, max: 100)
- [ ] User ownership verification for resources
- [ ] Documentation in JSDoc comments
- [ ] Unit and integration tests

---

## Next Steps

1. Copy the patterns above to each route file
2. Implement service methods if not already done
3. Add comprehensive error handling
4. Add logging for debugging
5. Write tests for each route
6. Deploy and monitor performance

See [API Documentation](./API_DOCUMENTATION.md) for endpoint details.

See [Backend README](../backend/README.md) for architecture overview.
