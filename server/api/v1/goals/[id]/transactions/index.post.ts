import { z } from "zod";

const createTransactionSchema = z.object({
    amount: z.number().positive(),
    type: z.enum(["DEPOSIT", "WITHDRAW"]),
    note: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");
    const user = await requireUser(event);

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "Missing ID" });
    }

    const goalId = parseInt(id);

    const goal = await prisma.goal.findUnique({
        where: { id: goalId },
    });

    if (!goal) {
        throw createError({ statusCode: 404, statusMessage: "Goal not found" });
    }

    if (goal.ownerId !== user.id) {
        throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }

    const body = await readBody(event);
    const result = createTransactionSchema.safeParse(body);

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid input",
            data: result.error.issues,
        });
    }

    const { amount, type, note } = result.data;

    const [transaction, updatedGoal] = await prisma.$transaction([
        prisma.transaction.create({
            data: {
                goalId,
                userId: user.id,
                amount,
                type,
                note,
            },
        }),
        prisma.goal.update({
            where: { id: goalId },
            data: {
                savedAmount: {
                    increment: type === "DEPOSIT" ? amount : -amount,
                },
            },
        }),
    ]);

    return transaction;
});
