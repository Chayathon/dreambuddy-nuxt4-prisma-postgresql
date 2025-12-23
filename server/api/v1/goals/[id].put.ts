import { z } from "zod";

const updateGoalSchema = z.object({
    title: z.string().min(1).optional(),
    targetAmount: z.number().positive().optional(),
    targetDate: z.string().or(z.date()).optional(),
    category: z.string().optional(),
    visibility: z.enum(["PRIVATE", "PUBLIC", "LINK_ONLY"]).optional(),
    note: z.string().optional(),
    imageUrl: z.string().optional(),
});

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

    const body = await readBody(event);
    const result = updateGoalSchema.safeParse(body);

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid input",
            data: result.error.issues,
        });
    }

    const {
        title,
        targetAmount,
        targetDate,
        category,
        visibility,
        note,
        imageUrl,
    } = result.data;

    // จัดการ shareSlug กรณีเปลี่ยนเป็น LINK_ONLY
    let shareSlug = existingGoal.shareSlug;
    if (visibility === "LINK_ONLY" && !shareSlug) {
        shareSlug =
            Math.random().toString(36).substring(2, 10) +
            Date.now().toString(36);
    }

    const updatedGoal = await prisma.goal.update({
        where: { id: goalId },
        data: {
            title,
            targetAmount,
            targetDate: targetDate ? new Date(targetDate) : undefined,
            category,
            visibility,
            note,
            imageUrl,
            shareSlug,
        },
    });

    return updatedGoal;
});
