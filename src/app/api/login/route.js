import { db } from '@/config/firebase-admin';
import { compare } from 'bcryptjs';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }


    const adminDoc = await db.collection('admin').doc('login').get();

    if (!adminDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Admin configuration not found' },
        { status: 401 }
      );
    }

    const adminData = adminDoc.data();
    const storedPassword = adminData.password;

    // Compare the provided password with the stored hashed password
    const isMatch = await compare(password, storedPassword);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        role: 'admin',
        id: 'admin-login' 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      token,
      expiresIn: 3600 // 1 hour in seconds
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}