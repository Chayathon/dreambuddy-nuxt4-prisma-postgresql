import { prisma } from "../../../../../utils/prisma";
import { requireUser } from "../../../../../utils/auth";

export default defineEventHandler(async (event) => {
    const user = await requireUser(event);
    const goalId = Number(getRouterParam(event, "id"));
    const commentId = Number(getRouterParam(event, "commentId"));

    if (isNaN(goalId) || isNaN(commentId)) {
        throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
    }

    const body = await readBody(event);
    const { content } = body;

    if (!content || content.trim() === "") {
        throw createError({
            statusCode: 400,
            statusMessage: "Comment content is required",
        });
    }

    // Check if comment exists and belongs to user
    const comment = await prisma.goalComment.findUnique({
        where: { id: commentId },
    });

    if (!comment) {
        throw createError({
            statusCode: 404,
            statusMessage: "Comment not found",
        });
    }

    if (comment.goalId !== goalId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Comment does not belong to this goal",
        });
    }

    if (comment.userId !== user.id) {
        throw createError({
            statusCode: 403,
            statusMessage: "You can only edit your own comments",
        });
    }

    const updatedComment = await prisma.goalComment.update({
        where: { id: commentId },
        data: { content: content.trim() },
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

    return updatedComment;
});
