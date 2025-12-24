<template>
    <div class="container mx-auto px-4 py-8">
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold mb-4">
                {{ $t("explore.exploreTitle") }}
            </h1>
            <p class="text-gray-600">
                {{ $t("explore.exploreSubtitle") }}
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UCard
                v-for="goal in localGoals"
                :key="goal.id"
                class="hover:shadow-lg transition-all hover:-translate-y-1"
            >
                <template #header>
                    <div class="flex items-center gap-3">
                        <UAvatar
                            :src="goal.owner?.avatarUrl ?? undefined"
                            :alt="goal.owner?.username"
                            size="sm"
                        />
                        <div class="overflow-hidden">
                            <p class="text-sm font-medium truncate">
                                {{ goal.owner?.name || goal.owner?.username }}
                            </p>
                            <p class="text-xs text-gray-500 truncate">
                                @{{ goal.owner?.username }}
                            </p>
                        </div>
                    </div>
                </template>

                <div class="space-y-3">
                    <h3 class="font-bold text-lg truncate">{{ goal.title }}</h3>

                    <div class="flex justify-between text-sm text-gray-600">
                        <span>{{ $t("goals.progress") }}</span>
                        <span class="font-medium text-primary"
                            >{{
                                getProgress(
                                    Number(goal.savedAmount),
                                    Number(goal.targetAmount)
                                )
                            }}%</span
                        >
                    </div>
                    <UProgress
                        :model-value="
                            getProgress(
                                Number(goal.savedAmount),
                                Number(goal.targetAmount)
                            )
                        "
                        size="sm"
                    />

                    <div class="flex justify-between items-end pt-2">
                        <div>
                            <p class="text-xs text-gray-500">
                                {{ $t("goals.goal") }}
                            </p>
                            <p class="font-semibold">
                                {{ Number(goal.targetAmount).toLocaleString() }}
                            </p>
                        </div>
                        <div class="flex items-center gap-3">
                            <!-- Like Button -->
                            <button
                                @click.stop="toggleLike(goal)"
                                :disabled="likingGoalId === goal.id"
                                class="flex items-center gap-1 transition-colors"
                                :class="
                                    goal.isLiked
                                        ? 'text-red-500'
                                        : 'text-gray-400 hover:text-red-500'
                                "
                            >
                                <UIcon
                                    :name="
                                        goal.isLiked
                                            ? 'i-heroicons-heart-solid'
                                            : 'i-heroicons-heart'
                                    "
                                    class="w-5 h-5"
                                />
                                <span class="text-sm">{{
                                    goal.likesCount || 0
                                }}</span>
                            </button>

                            <!-- Comment Button -->
                            <button
                                @click.stop="openComments(goal)"
                                class="flex items-center gap-1 text-gray-400 hover:text-primary transition-colors"
                            >
                                <UIcon
                                    name="i-heroicons-chat-bubble-left"
                                    class="w-5 h-5"
                                />
                                <span class="text-sm">{{
                                    goal.commentsCount || 0
                                }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </UCard>
        </div>

        <!-- Comments Modal -->
        <UModal v-model:open="showCommentsModal">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">
                                {{ $t("explore.comments") }}
                            </h3>
                            <UButton
                                icon="i-heroicons-x-mark"
                                variant="ghost"
                                color="neutral"
                                @click="showCommentsModal = false"
                            />
                        </div>
                    </template>

                    <div class="space-y-4 max-h-96 overflow-y-auto">
                        <!-- Loading State -->
                        <div
                            v-if="loadingComments"
                            class="flex justify-center py-8"
                        >
                            <UIcon
                                name="i-heroicons-arrow-path"
                                class="w-6 h-6 animate-spin text-gray-400"
                            />
                        </div>

                        <!-- Empty State -->
                        <div
                            v-else-if="comments.length === 0"
                            class="text-center py-8 text-gray-500"
                        >
                            <UIcon
                                name="i-heroicons-chat-bubble-left-right"
                                class="w-12 h-12 mx-auto mb-2 opacity-50"
                            />
                            <p>{{ $t("explore.noComments") }}</p>
                        </div>

                        <!-- Comments List -->
                        <div
                            v-else
                            v-for="comment in comments"
                            :key="comment.id"
                            class="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                            <UAvatar
                                :src="comment.user?.avatarUrl ?? undefined"
                                :alt="comment.user?.username"
                                size="sm"
                            />
                            <div class="flex-1 min-w-0">
                                <div
                                    class="flex items-center justify-between gap-2"
                                >
                                    <div class="flex items-center gap-2">
                                        <span class="font-medium text-sm">{{
                                            comment.user?.name ||
                                            comment.user?.username
                                        }}</span>
                                        <span class="text-xs text-gray-500">{{
                                            formatDate(comment.createdAt)
                                        }}</span>
                                    </div>
                                    <!-- Edit/Delete for comment owner -->
                                    <div
                                        v-if="
                                            user && comment.user?.id === user.id
                                        "
                                        class="flex items-center gap-1"
                                    >
                                        <UButton
                                            icon="i-heroicons-pencil"
                                            variant="ghost"
                                            color="neutral"
                                            size="xs"
                                            @click="startEditComment(comment)"
                                        />
                                        <UButton
                                            icon="i-heroicons-trash"
                                            variant="ghost"
                                            color="error"
                                            size="xs"
                                            @click="deleteComment(comment.id)"
                                            :loading="
                                                deletingCommentId === comment.id
                                            "
                                        />
                                    </div>
                                </div>

                                <!-- Edit Mode -->
                                <div
                                    v-if="editingCommentId === comment.id"
                                    class="mt-2"
                                >
                                    <UTextarea
                                        v-model="editCommentContent"
                                        :rows="2"
                                        class="w-full"
                                    />
                                    <div class="flex gap-2 mt-2">
                                        <UButton
                                            size="xs"
                                            @click="saveEditComment(comment.id)"
                                            :loading="savingComment"
                                        >
                                            {{ $t("common.save") }}
                                        </UButton>
                                        <UButton
                                            size="xs"
                                            variant="ghost"
                                            @click="cancelEditComment"
                                        >
                                            {{ $t("common.cancel") }}
                                        </UButton>
                                    </div>
                                </div>

                                <!-- Normal Display -->
                                <p v-else class="text-sm mt-1 break-words">
                                    {{ comment.content }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <!-- Add Comment Form -->
                        <div v-if="user" class="flex gap-2">
                            <UTextarea
                                v-model="newComment"
                                :placeholder="$t('explore.commentPlaceholder')"
                                :rows="2"
                                class="flex-1"
                            />
                            <UButton
                                @click="submitComment"
                                :loading="submittingComment"
                                :disabled="!newComment.trim()"
                            >
                                {{ $t("explore.send") }}
                            </UButton>
                        </div>
                        <div v-else class="text-center py-2">
                            <p class="text-sm text-gray-500 mb-2">
                                {{ $t("explore.loginToComment") }}
                            </p>
                            <UButton
                                @click="navigateTo('/auth/login')"
                                variant="soft"
                            >
                                {{ $t("nav.signIn") }}
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
useHead({
    title: "Explore Dreams - DreamBuddy",
    meta: [
        {
            name: "description",
            content:
                "See what others are saving for and get inspired by their goals on DreamBuddy.",
        },
    ],
});

const { $t } = useI18n();
const { user } = useAuth();
const toast = useToast();

interface GoalWithDetails {
    id: number;
    title: string;
    savedAmount: string | number;
    targetAmount: string | number;
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    owner?: {
        id: number;
        name: string | null;
        username: string;
        avatarUrl: string | null;
    };
}

interface CommentWithUser extends GoalComment {
    user?: {
        id: number;
        name: string | null;
        username: string;
        avatarUrl: string | null;
    };
}

const { data: goals } = await useFetch<GoalWithDetails[]>(
    "/api/v1/explore/goals"
);

// Local state for optimistic updates
const localGoals = ref<GoalWithDetails[]>([]);

watch(
    goals,
    (newGoals) => {
        if (newGoals) {
            localGoals.value = [...newGoals];
        }
    },
    { immediate: true }
);

const getProgress = (saved: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(100, Math.round((saved / target) * 100));
};

// Like functionality
const likingGoalId = ref<number | null>(null);

const toggleLike = async (goal: GoalWithDetails) => {
    if (!user.value) {
        navigateTo("/auth/login");
        return;
    }

    likingGoalId.value = goal.id;

    // Optimistic update
    const goalIndex = localGoals.value.findIndex((g) => g.id === goal.id);
    if (goalIndex !== -1) {
        const wasLiked = localGoals.value[goalIndex].isLiked;
        localGoals.value[goalIndex].isLiked = !wasLiked;
        localGoals.value[goalIndex].likesCount += wasLiked ? -1 : 1;
    }

    try {
        await $fetch(`/api/v1/goals/${goal.id}/like`, {
            method: "POST",
        });
    } catch (error: any) {
        // Revert optimistic update on error
        if (goalIndex !== -1) {
            const wasLiked = localGoals.value[goalIndex].isLiked;
            localGoals.value[goalIndex].isLiked = !wasLiked;
            localGoals.value[goalIndex].likesCount += wasLiked ? -1 : 1;
        }
        toast.add({
            title: "Error",
            description: error.data?.message || "Failed to update like",
            color: "error",
        });
    } finally {
        likingGoalId.value = null;
    }
};

// Comments functionality
const showCommentsModal = ref(false);
const selectedGoal = ref<GoalWithDetails | null>(null);
const comments = ref<CommentWithUser[]>([]);
const loadingComments = ref(false);
const newComment = ref("");
const submittingComment = ref(false);
const editingCommentId = ref<number | null>(null);
const editCommentContent = ref("");
const savingComment = ref(false);
const deletingCommentId = ref<number | null>(null);

const openComments = async (goal: GoalWithDetails) => {
    selectedGoal.value = goal;
    showCommentsModal.value = true;
    await fetchComments(goal.id);
};

const fetchComments = async (goalId: number) => {
    loadingComments.value = true;
    try {
        const data = await $fetch<CommentWithUser[]>(
            `/api/v1/goals/${goalId}/comments`
        );
        comments.value = data;
    } catch (error) {
        toast.add({
            title:
                String($t("explore.notify.loadCommentsErrorTitle")) || "Error",
            description:
                String($t("explore.notify.loadCommentsErrorMessage")) ||
                "Failed to load comments",
            color: "error",
        });
    } finally {
        loadingComments.value = false;
    }
};

const submitComment = async () => {
    if (!user.value) {
        navigateTo("/auth/login");
        return;
    }

    if (!newComment.value.trim() || !selectedGoal.value) return;

    submittingComment.value = true;
    try {
        const comment = await $fetch<CommentWithUser>(
            `/api/v1/goals/${selectedGoal.value.id}/comments`,
            {
                method: "POST",
                body: { content: newComment.value },
            }
        );

        toast.add({
            title:
                String($t("explore.notify.addCommentSuccessTitle")) ||
                "Success",
            description:
                String($t("explore.notify.addCommentSuccessMessage")) ||
                "Comment added successfully",
            color: "success",
        });
        comments.value.unshift(comment);
        newComment.value = "";

        // Update comments count in local goals
        const goalIndex = localGoals.value.findIndex(
            (g) => g.id === selectedGoal.value?.id
        );
        if (goalIndex !== -1) {
            localGoals.value[goalIndex].commentsCount++;
        }
    } catch (error: any) {
        toast.add({
            title: String($t("explore.notify.addCommentErrorTitle")) || "Error",
            description:
                String($t("explore.notify.addCommentErrorMessage")) ||
                "Failed to add comment",
            color: "error",
        });
    } finally {
        submittingComment.value = false;
    }
};

const startEditComment = (comment: CommentWithUser) => {
    editingCommentId.value = comment.id;
    editCommentContent.value = comment.content;
};

const cancelEditComment = () => {
    editingCommentId.value = null;
    editCommentContent.value = "";
};

const saveEditComment = async (commentId: number) => {
    if (!editCommentContent.value.trim() || !selectedGoal.value) return;

    savingComment.value = true;
    try {
        const updated = await $fetch<CommentWithUser>(
            `/api/v1/goals/${selectedGoal.value.id}/comments/${commentId}`,
            {
                method: "PUT",
                body: { content: editCommentContent.value },
            }
        );

        toast.add({
            title:
                String($t("explore.notify.updateCommentSuccessTitle")) ||
                "Success",
            description:
                String($t("explore.notify.updateCommentSuccessMessage")) ||
                "Comment updated successfully",
            color: "success",
        });

        const index = comments.value.findIndex((c) => c.id === commentId);
        if (index !== -1) {
            comments.value[index] = updated;
        }
        cancelEditComment();
    } catch (error: any) {
        toast.add({
            title:
                String($t("explore.notify.updateCommentErrorTitle")) || "Error",
            description:
                String($t("explore.notify.updateCommentErrorMessage")) ||
                "Failed to update comment",
            color: "error",
        });
    } finally {
        savingComment.value = false;
    }
};

const deleteComment = async (commentId: number) => {
    if (!selectedGoal.value) return;

    deletingCommentId.value = commentId;
    try {
        await $fetch(
            `/api/v1/goals/${selectedGoal.value.id}/comments/${commentId}`,
            {
                method: "DELETE",
            }
        );

        toast.add({
            title:
                String($t("explore.notify.deleteCommentSuccessTitle")) ||
                "Success",
            description:
                String($t("explore.notify.deleteCommentSuccessMessage")) ||
                "Comment deleted successfully",
            color: "success",
        });

        comments.value = comments.value.filter((c) => c.id !== commentId);

        // Update comments count in local goals
        const goalIndex = localGoals.value.findIndex(
            (g) => g.id === selectedGoal.value?.id
        );
        if (goalIndex !== -1) {
            localGoals.value[goalIndex].commentsCount--;
        }
    } catch (error: any) {
        toast.add({
            title:
                String($t("explore.notify.deleteCommentErrorTitle")) || "Error",
            description:
                String($t("explore.notify.deleteCommentErrorMessage")) ||
                "Failed to delete comment",
            color: "error",
        });
    } finally {
        deletingCommentId.value = null;
    }
};

const formatDate = (date: string | Date) => {
    let locale: string | undefined = undefined;
    if (typeof window !== "undefined") {
        try {
            const v = localStorage.getItem("dreambuddy-locale");
            if (v === "th") locale = "th-TH";
            else if (v === "en") locale = "en-US";
        } catch (e) {}
    }

    return new Date(date).toLocaleString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};
</script>

<style scoped></style>
