export default defineEventHandler(async (event) => {
    const user = await requireUser(event);

    const goals = await prisma.goal.findMany({
        where: {
            ownerId: user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return goals;
});
