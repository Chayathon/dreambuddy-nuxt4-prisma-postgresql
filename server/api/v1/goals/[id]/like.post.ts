import { prisma } from "../../../../utils/prisma";
import { requireUser } from "../../../../utils/auth";

export default defineEventHandler(async (event) => {
    const user = await requireUser(event);
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
            statusMessage: "Cannot like a private goal",
        });
    }

    // Check if user already liked
    const existingLike = await prisma.goalLike.findUnique({
        where: {
            userId_goalId: {
                userId: user.id,
                goalId: goalId,
            },
        },
    });

    if (existingLike) {
        // Unlike
        await prisma.$transaction([
            prisma.goalLike.delete({
                where: {
                    userId_goalId: {
                        userId: user.id,
                        goalId: goalId,
                    },
                },
            }),
            prisma.goal.update({
                where: { id: goalId },
                data: { likesCount: { decrement: 1 } },
            }),
        ]);

        return {
            liked: false,
            likesCount: goal.likesCount - 1,
        };
    } else {
        // Like
        await prisma.$transaction([
            prisma.goalLike.create({
                data: {
                    userId: user.id,
                    goalId: goalId,
                },
            }),
            prisma.goal.update({
                where: { id: goalId },
                data: { likesCount: { increment: 1 } },
            }),
        ]);

        return {
            liked: true,
            likesCount: goal.likesCount + 1,
        };
    }
});
