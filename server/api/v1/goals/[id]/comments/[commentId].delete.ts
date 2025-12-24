import { prisma } from "../../../../../utils/prisma";
import { requireUser } from "../../../../../utils/auth";

export default defineEventHandler(async (event) => {
    const user = await requireUser(event);
    const goalId = Number(getRouterParam(event, "id"));
    const commentId = Number(getRouterParam(event, "commentId"));

    if (isNaN(goalId) || isNaN(commentId)) {
        throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
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
            statusMessage: "You can only delete your own comments",
        });
    }

    await prisma.goalComment.delete({
        where: { id: commentId },
    });

    return { success: true };
});
