import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import type { DateOption } from '@/lib/types';
import InviteExperience from '@/components/InviteExperience';

export const metadata: Metadata = {
  title: 'You have an invitation 💌',
  description: 'Someone has a question for you…',
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const invite = await prisma.invite.findUnique({ where: { slug } });
  if (!invite) notFound();

  return (
    <InviteExperience
      invite={{
        slug: invite.slug,
        fromName: invite.fromName,
        toName: invite.toName,
        message: invite.message,
        theme: invite.theme,
        dateOptions: invite.dateOptions as DateOption[],
      }}
    />
  );
}
