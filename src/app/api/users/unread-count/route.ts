import { NextRequest } from 'next/server';
import { userController } from '@/backend/controllers';

// GET /api/users/unread-count
export async function GET(request: NextRequest) {
  return userController.getUnreadCount(request);
}
