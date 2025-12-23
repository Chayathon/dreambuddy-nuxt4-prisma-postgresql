import { z } from "zod";

const createGoalSchema = z.object({
    title: z.string().min(1),
    targetAmount: z.number().positive(),
    targetDate: z.string().or(z.date()),
    category: z.string().optional(),
    visibility: z.enum(["PRIVATE", "PUBLIC", "LINK_ONLY"]).default("PRIVATE"),
    note: z.string().optional(),
    imageUrl: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const user = await requireUser(event);
    const body = await readBody(event);

    const result = createGoalSchema.safeParse(body);

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

    let shareSlug = null;
    // ถ้ากำหนดการมองเห็นเป็น LINK_ONLY ให้สร้าง slug สำหรับแชร์
    if (visibility === "LINK_ONLY") {
        shareSlug =
            Math.random().toString(36).substring(2, 10) +
            Date.now().toString(36);
    }

    const goal = await prisma.goal.create({
        data: {
            title,
            targetAmount,
            targetDate: new Date(targetDate),
            category,
            visibility,
            note,
            imageUrl,
            shareSlug,
            ownerId: user.id,
        },
    });

    return goal;
});
