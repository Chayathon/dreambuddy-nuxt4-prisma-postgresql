import { prisma } from "../../../../../utils/prisma";
import { requireUser } from "../../../../../utils/auth";

export default defineEventHandler(async (event) => {
    const user = await requireUser(event);
    const goalId = Number(getRouterParam(event, "id"));

    if (isNaN(goalId)) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid goal ID",
        });
    }

    const body = await readBody(event);
    const { content } = body;

    if (!content || content.trim() === "") {
        throw createError({
            statusCode: 400,
            statusMessage: "Comment content is required",
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
            statusMessage: "Cannot comment on a private goal",
        });
    }

    const comment = await prisma.goalComment.create({
        data: {
            goalId: goalId,
            userId: user.id,
            content: content.trim(),
        },
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
    });

    return comment;
});
