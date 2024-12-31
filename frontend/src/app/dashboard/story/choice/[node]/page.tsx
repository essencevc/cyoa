import React from "react";

import ChoiceInterface from "@/components/node/choice-interface";
import { db } from "@/db/db";
import { storyChoicesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import TerminalChoice from "@/components/node/terminal-choice";

const NodePage = async ({ params }: { params: { node: string } }) => {
  const choice = await db.query.storyChoicesTable.findFirst({
    where: eq(storyChoicesTable.id, params.node),
  });

  const children = await db.query.storyChoicesTable.findMany({
    where: eq(storyChoicesTable.parentId, params.node),
  });

  if (!choice) {
    return (
      <div className="font-mono max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-2 border-b border-green-900/30 pb-2">
          <span className="text-white">root@cyoa-os:~$</span>
          <span className="text-[#39FF14]">
            cyoa make-choice --id {params.node} --metadata
          </span>
        </div>
        <div className="mt-4 text-red-400">
          [ERROR] Story not found in database
        </div>
        <div className="mt-4">
          <Link href="/dashboard" className="text-[#39FF14] hover:underline">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  await db
    .update(storyChoicesTable)
    .set({ explored: 1 })
    .where(eq(storyChoicesTable.id, params.node))
    .execute();

  if (choice.isTerminal) {
    return <TerminalChoice choice={choice} />;
  }

  return (
    <ChoiceInterface
      title={choice.title}
      description={choice.description}
      choices={children}
    />
  );
};

export default NodePage;
