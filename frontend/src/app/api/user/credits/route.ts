import { auth } from "@/auth";
import { db } from "@/db/db";
import { usersTable } from "@/db/schema";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, session.user.username as string),
    columns: {
      credits: true,
    },
  });

  return NextResponse.json(user?.credits ?? 0);
}
