import { prisma } from "../../../utils/prisma";
import { getCurrentUser } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
    const currentUser = await getCurrentUser(event);

    const goals = await prisma.goal.findMany({
        where: {
            visibility: "PUBLIC",
        },
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
            likes: currentUser
                ? {
                      where: { userId: currentUser.id },
                      select: { userId: true },
                  }
                : false,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 50,
    });

    // Map to add isLiked and commentsCount fields
    const goalsWithLikeStatus = goals.map((goal) => ({
        ...goal,
        isLiked: currentUser ? goal.likes && goal.likes.length > 0 : false,
        commentsCount: goal._count.comments,
        likes: undefined,
        _count: undefined,
    }));

    return goalsWithLikeStatus;
});
