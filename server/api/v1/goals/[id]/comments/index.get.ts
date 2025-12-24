import { prisma } from "../../../../../utils/prisma";

export default defineEventHandler(async (event) => {
    const goalId = Number(getRouterParam(event, "id"));

    if (isNaN(goalId)) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid goal ID",
        });
    }

    // Check if goal exists and is public
    const goal = await prisma.goal.findUnique({
        where: { id: goalId },
    });

    if (!goal) {
        throw createError({ statusCode: 404, statusMessage: "Goal not found" });
    }

    if (goal.visibility !== "PUBLIC") {
        throw createError({
            statusCode: 403,
            statusMessage: "Cannot view comments of a private goal",
        });
    }

    const comments = await prisma.goalComment.findMany({
        where: { goalId: goalId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatarUrl: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return comments;
});
