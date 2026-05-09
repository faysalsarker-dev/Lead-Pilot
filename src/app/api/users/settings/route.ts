import { NextRequest } from 'next/server';
import { userController } from '@/backend/controllers';

// GET /api/users/settings
export async function GET(request: NextRequest) {
  return userController.getSettings(request);
}

// PUT /api/users/settings
export async function PUT(request: NextRequest) {
  return userController.updateSettings(request);
}
