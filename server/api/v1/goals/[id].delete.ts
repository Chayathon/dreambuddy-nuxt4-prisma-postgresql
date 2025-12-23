export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");
    const user = await requireUser(event);

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "Missing ID" });
    }

    const goalId = parseInt(id);

    const existingGoal = await prisma.goal.findUnique({
        where: { id: goalId },
    });

    if (!existingGoal) {
        throw createError({ statusCode: 404, statusMessage: "Goal not found" });
    }

    if (existingGoal.ownerId !== user.id) {
        throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }

    await prisma.goal.delete({
        where: { id: goalId },
    });

    return { success: true };
});
