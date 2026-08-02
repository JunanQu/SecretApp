import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { normalizeProposedTimes } from '@/lib/proposed';
import { originFromHeaders } from '@/lib/url';
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
  const origin = originFromHeaders(await headers());
  const invite = await prisma.invite.findUnique({
    where: { secret },
    include: { responses: { orderBy: { createdAt: 'desc' } } },
  });
  if (!invite) notFound();

  return (
    <Suspense>
      <ManageView
      inviteUrl={`${origin}/i/${invite.slug}`}
      secret={invite.secret}
      toEmail={invite.toEmail}
      inviteSentAt={invite.inviteSentAt?.toISOString() ?? null}
      invite={{
        slug: invite.slug,
        fromName: invite.fromName,
        toName: invite.toName,
        message: invite.message,
        theme: invite.theme,
        location: invite.location,
        dateOptions: invite.dateOptions as DateOption[],
      }}
      responses={invite.responses.map((r) => ({
        id: r.id,
        accepted: r.accepted,
        selectedOptionIds: r.selectedOptionIds as string[],
        proposedTimes: normalizeProposedTimes(r.proposedTimes),
        note: r.note,
        createdAt: r.createdAt.toISOString(),
      }))}
      />
    </Suspense>
  );
}
