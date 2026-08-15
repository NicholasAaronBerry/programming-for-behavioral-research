import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

async function startStudy(formData: FormData) {
  "use server";

  const prolificId = formData.get("prolificId")?.toString().trim();

  if (!prolificId) {
    redirect("/?error=missing-id");
  }

  const participant = await prisma.participant.upsert({
    where: { prolificId },
    update: {},
    create: { prolificId },
    include: { demographics: true },
  });

  const cookieStore = await cookies();
  cookieStore.set("participantId", participant.id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  if (!participant.consented) {
    redirect("/consent");
  } else if (!participant.demographics) {
    redirect("/demographics");
  } else if (!participant.instructionsCompleted) {
    redirect("/instructions");
  } else {
    redirect("/task");
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-white dark:bg-black px-6">
      <div className="flex flex-col items-center text-center gap-4 max-w-lg">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Resurgence Experiment
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg">
          Please enter your Prolific ID to begin.
        </p>

        <form action={startStudy} className="w-full flex flex-col gap-3 mt-2">
          <input
            type="text"
            name="prolificId"
            placeholder="Prolific ID"
            required
            className="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
          {error === "missing-id" && (
            <p className="text-sm text-red-500">
              Please enter your Prolific ID.
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold py-3 px-6 rounded"
          >
            Begin Study
          </button>
        </form>
      </div>
    </div>
  );
}
