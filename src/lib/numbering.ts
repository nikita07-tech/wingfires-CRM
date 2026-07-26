import { prisma } from "@/lib/prisma";

export async function nextNumber(key: string): Promise<string> {
  const seq = await prisma.numberingSequence.update({
    where: { key },
    data: { nextValue: { increment: 1 } },
  });
  const value = seq.nextValue - 1;
  return `${seq.prefix}-${String(value).padStart(seq.padding, "0")}`;
}