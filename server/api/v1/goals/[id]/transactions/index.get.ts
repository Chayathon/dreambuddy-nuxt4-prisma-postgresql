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

    const transactions = await prisma.transaction.findMany({
        where: { goalId },
        orderBy: { createdAt: "desc" },
    });

    return transactions;
});
