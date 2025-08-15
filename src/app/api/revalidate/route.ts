import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const { secret, type, slug } = await req.json();
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ ok:false, error:'unauthorized' }, { status: 401 });
    }
    if (type === 'list') {
      revalidateTag('post-list');
      return NextResponse.json({ ok:true, revalidated:'tag:post-list' });
    }
    if (type === 'detail' && typeof slug === 'string') {
      revalidatePath(`/blog/${slug}`);
      return NextResponse.json({ ok:true, revalidated:`/blog/${slug}` });
    }
    return NextResponse.json({ ok:false, error:'invalid payload' }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok:false, error:message }, { status: 500 });
  }
}