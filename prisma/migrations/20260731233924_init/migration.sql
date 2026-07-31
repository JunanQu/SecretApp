-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "toName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'blush',
    "dateOptions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL,
    "selectedOptionIds" JSONB NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invite_slug_key" ON "Invite"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_secret_key" ON "Invite"("secret");

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "Invite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
