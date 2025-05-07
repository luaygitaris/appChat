import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import * as bcrypt from 'bcrypt-ts';

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, email, Password: hashed },
  });

  return NextResponse.json({ message: 'Registered successfully' });
}
