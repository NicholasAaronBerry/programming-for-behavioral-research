"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function recordResponse(
  phase: number,
  button: string,
  reinforced: boolean
) {
  const cookieStore = await cookies();
  const participantId = cookieStore.get("participantId")?.value;
  if (!participantId) return;

  await prisma.response.create({
    data: { participantId, phase, button, reinforced },
  });
}

export async function recordPhaseStart(phase: number) {
  const cookieStore = await cookies();
  const participantId = cookieStore.get("participantId")?.value;
  if (!participantId) return;

  const field =
    phase === 1
      ? "phase1StartedAt"
      : phase === 2
      ? "phase2StartedAt"
      : "phase3StartedAt";

  await prisma.participant.update({
    where: { id: participantId },
    data: { [field]: new Date() },
  });
}

export async function completeTask() {
  const cookieStore = await cookies();
  const participantId = cookieStore.get("participantId")?.value;
  if (!participantId) redirect("/");

  await prisma.participant.update({
    where: { id: participantId },
    data: { taskCompleted: true },
  });

  redirect("/debrief");
}
