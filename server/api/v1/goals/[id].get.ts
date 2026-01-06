import { prisma } from "../../../utils/prisma";
import { getCurrentUser } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");
    const user = await getCurrentUser(event);

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "Missing ID" });
    }

    const goal = await prisma.goal.findUnique({
        where: { id: parseInt(id) },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatarUrl: true,
                },
            },
            _count: {
                select: {
                    comments: true,
                },
            },
        },
    });

    if (!goal) {
        throw createError({ statusCode: 404, statusMessage: "Goal not found" });
    }

    const isOwner = user?.id === goal.ownerId;

    if (!isOwner) {
        throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }

    return {
        ...goal,
        commentsCount: goal._count.comments,
        _count: undefined,
    };
});
