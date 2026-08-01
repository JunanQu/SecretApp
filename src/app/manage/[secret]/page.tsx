import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import type { DateOption } from '@/lib/types';
import ManageView from '@/components/ManageView';

export const metadata: Metadata = {
  title: 'Your invite — SecretApp',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ManagePage({
  params,
}: {
  params: Promise<{ secret: string }>;
}) {
  const { secret } = await params;
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000';
  const proto = headerList.get('x-forwarded-proto') ?? 'http';
  const invite = await prisma.invite.findUnique({
    where: { secret },
    include: { responses: { orderBy: { createdAt: 'desc' } } },
  });
  if (!invite) notFound();

  return (
    <Suspense>
      <ManageView
      inviteUrl={`${proto}://${host}/i/${invite.slug}`}
      invite={{
        slug: invite.slug,
        fromName: invite.fromName,
        toName: invite.toName,
        message: invite.message,
        theme: invite.theme,
        dateOptions: invite.dateOptions as DateOption[],
      }}
      responses={invite.responses.map((r) => ({
        id: r.id,
        accepted: r.accepted,
        selectedOptionIds: r.selectedOptionIds as string[],
        proposedTimes: (r.proposedTimes as string[]) ?? [],
        note: r.note,
        createdAt: r.createdAt.toISOString(),
      }))}
      />
    </Suspense>
  );
}
