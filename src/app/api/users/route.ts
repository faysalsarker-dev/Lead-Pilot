import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/backend/controllers';

// GET /api/users/profile
export async function GET(request: NextRequest) {
  return userController.getProfile(request);
}

// PUT /api/users/profile
export async function PUT(request: NextRequest) {
  return userController.updateProfile(request);
}
