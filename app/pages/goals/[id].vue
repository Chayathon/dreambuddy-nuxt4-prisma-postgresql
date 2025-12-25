<template>
    <div class="container mx-auto px-4 py-8">
        <div v-if="error" class="text-center text-red-500">
            {{ error.statusMessage || "Error loading goal" }}
        </div>

        <div v-else-if="goal" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column: Goal Info -->
            <div class="lg:col-span-2 space-y-6">
                <div class="flex items-center justify-between">
                    <UButton
                        to="/goals"
                        variant="ghost"
                        icon="i-heroicons-arrow-left"
                        >{{ $t("common.back") }}</UButton
                    >
                    <div class="flex gap-2">
                        <UBadge
                            :color="
                                goal.visibility === 'PRIVATE'
                                    ? 'neutral'
                                    : 'success'
                            "
                            >{{ goal.visibility }}</UBadge
                        >
                        <UButton
                            v-if="goal.visibility === 'LINK_ONLY'"
                            icon="i-heroicons-link"
                            variant="ghost"
                            color="neutral"
                            @click="copyLink"
                        />
                    </div>
                </div>

                <UCard>
                    <div class="flex flex-col md:flex-row gap-6">
                        <div
                            v-if="goal.imageUrl"
                            class="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden bg-gray-100"
                        >
                            <img
                                :src="goal.imageUrl"
                                class="w-full h-full object-cover"
                            />
                        </div>
                        <div class="flex-1">
                            <h1 class="text-3xl font-bold mb-2">
                                {{ goal.title }}
                            </h1>
                            <p class="text-gray-500 mb-4">
                                {{ goal.category }}
                            </p>
                            <p v-if="goal.note" class="text-gray-700 mb-4">
                                {{ goal.note }}
                            </p>

                            <div class="space-y-2">
                                <div class="flex justify-between text-sm">
                                    <span class="font-medium"
                                        >{{ $t("goals.progress") }} ({{
                                            getProgress(
                                                Number(goal.savedAmount),
                                                Number(goal.targetAmount)
                                            )
                                        }}%)</span
                                    >
                                    <span class="text-gray-500"
                                        >{{ $t("goals.targetDate") }}:
                                        {{
                                            formatDateFull(goal.targetDate)
                                        }}</span
                                    >
                                </div>
                                <UProgress
                                    :model-value="
                                        getProgress(
                                            Number(goal.savedAmount),
                                            Number(goal.targetAmount)
                                        )
                                    "
                                    size="lg"
                                />
                                <div
                                    class="flex justify-between items-end mt-2"
                                >
                                    <div>
                                        <p class="text-sm text-gray-500">
                                            {{ $t("goals.saved") }}
                                        </p>
                                        <p
                                            class="text-2xl font-bold text-primary"
                                        >
                                            {{
                                                Number(
                                                    goal.savedAmount
                                                ).toLocaleString()
                                            }}
                                        </p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm text-gray-500">
                                            {{ $t("goals.target") }}
                                        </p>
                                        <p class="text-xl font-semibold">
                                            {{
                                                Number(
                                                    goal.targetAmount
                                                ).toLocaleString()
                                            }}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                                >
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <span
                                            class="text-sm text-gray-600 dark:text-gray-300"
                                        >
                                            {{ $t("goals.dailyTarget") }}
                                        </span>
                                        <span
                                            class="text-sm font-semibold text-primary-700 dark:text-primary-300"
                                        >
                                            {{
                                                getDailyTarget(
                                                    Number(goal.savedAmount),
                                                    Number(goal.targetAmount),
                                                    goal.targetDate
                                                ).toLocaleString(undefined, {
                                                    maximumFractionDigits: 2,
                                                })
                                            }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <div class="flex justify-end">
                            <UButton
                                icon="i-heroicons-plus"
                                size="lg"
                                @click="isDepositModalOpen = true"
                            >
                                {{ $t("goals.transaction.addTransaction") }}
                            </UButton>
                        </div>
                    </template>
                </UCard>

                <!-- Transactions History -->
                <div class="mt-8">
                    <h2 class="text-xl font-bold mb-4">
                        {{ $t("goals.history") }}
                    </h2>
                    <UCard v-if="transactions?.length">
                        <div
                            v-for="tx in transactions"
                            :key="tx.id"
                            class="py-3 flex justify-between items-center"
                        >
                            <div class="flex items-center gap-3">
                                <div
                                    :class="`py-2 px-3 rounded-full ${
                                        tx.type === 'DEPOSIT'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-red-100 text-red-600'
                                    }`"
                                >
                                    <UIcon
                                        :name="
                                            tx.type === 'DEPOSIT'
                                                ? 'i-heroicons-arrow-up'
                                                : 'i-heroicons-arrow-down'
                                        "
                                    />
                                </div>
                                <div>
                                    <p class="font-medium">
                                        {{
                                            tx.type === "DEPOSIT"
                                                ? `${
                                                      $t(
                                                          "goals.transaction.deposit"
                                                      ) || "Deposit"
                                                  }`
                                                : `${
                                                      $t(
                                                          "goals.transaction.withdraw"
                                                      ) || "Withdraw"
                                                  }`
                                        }}
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        {{ formatDateTimeFull(tx.createdAt) }}
                                    </p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p
                                    :class="`font-bold ${
                                        tx.type === 'DEPOSIT'
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`"
                                >
                                    {{ tx.type === "DEPOSIT" ? "+" : "-"
                                    }}{{ Number(tx.amount).toLocaleString() }}
                                </p>
                                <p v-if="tx.note" class="text-xs text-gray-500">
                                    {{ tx.note }}
                                </p>
                            </div>
                        </div>
                    </UCard>
                    <div
                        v-else
                        class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg"
                    >
                        {{ $t("goals.transaction.noTransactions") }}
                    </div>
                </div>
            </div>

            <!-- Right Column: Stats / Social (Placeholder) -->
            <div class="space-y-6">
                <UCard>
                    <template #header>
                        <div class="flex justify-between">
                            <h3 class="font-semibold">
                                {{ $t("goals.details") }}
                            </h3>
                            <div>
                                <UButton
                                    icon="i-heroicons-pencil"
                                    variant="ghost"
                                    color="warning"
                                    size="sm"
                                    class="ml-auto"
                                    @click="isEditModalOpen = true"
                                />
                                <UButton
                                    @click="isDeleteModalOpen = true"
                                    icon="i-heroicons-trash"
                                    variant="ghost"
                                    color="error"
                                    size="sm"
                                    class="ml-2"
                                />
                            </div>
                        </div>
                    </template>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-500">{{
                                $t("goals.created")
                            }}</span>
                            <span>{{
                                formatDateTimeFull(goal.createdAt)
                            }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">{{
                                $t("goals.updated")
                            }}</span>
                            <span>{{
                                formatDateTimeFull(goal.updatedAt)
                            }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">{{
                                $t("goals.owner")
                            }}</span>
                            <span>{{
                                goal.owner?.name || goal.owner?.username
                            }}</span>
                        </div>
                    </div>
                </UCard>
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between w-full">
                            <h3 class="font-semibold">
                                {{
                                    $t("goals.likesComments") ||
                                    "Likes & Comments"
                                }}
                            </h3>
                            <div
                                class="flex justify-center items-center gap-2 text-sm text-gray-500"
                            >
                                <button
                                    @click="toggleLikersPanel"
                                    class="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <UIcon
                                        name="i-heroicons-heart"
                                        class="w-5 h-5"
                                    />
                                    <span class="text-sm">{{
                                        goal.likesCount || 0
                                    }}</span>
                                </button>

                                <button
                                    @click="toggleCommentsPanel"
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
                    </template>

                    <div v-if="goal.visibility === 'PUBLIC'">
                        <div v-if="showLikersPanel || showCommentsPanel">
                            <!-- Likers panel -->
                            <div v-show="showLikersPanel">
                                <div
                                    v-if="loadingLikers"
                                    class="py-2 flex justify-center"
                                >
                                    <UIcon
                                        name="i-heroicons-arrow-path"
                                        class="w-5 h-5 animate-spin text-gray-400"
                                    />
                                </div>
                                <div v-else>
                                    <div
                                        v-if="likers.length === 0"
                                        class="text-sm text-center text-gray-500"
                                    >
                                        {{
                                            $t("goals.noLikers") ||
                                            "No likes yet."
                                        }}
                                    </div>
                                    <div
                                        v-else
                                        class="space-y-3 max-h-64 overflow-y-auto"
                                    >
                                        <div
                                            v-for="like in likers"
                                            :key="like.id"
                                            class="flex w-full p-2 gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                        >
                                            <UAvatar
                                                :src="
                                                    like.avatarUrl ?? undefined
                                                "
                                                :alt="like.username"
                                                size="sm"
                                            />
                                            <div class="text-sm">
                                                <div class="font-medium">
                                                    {{
                                                        like.name ||
                                                        like.username
                                                    }}
                                                </div>
                                                <div
                                                    class="text-xs text-gray-500"
                                                >
                                                    @{{ like.username }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-show="showCommentsPanel">
                                <div
                                    v-if="loadingComments"
                                    class="py-4 flex justify-center"
                                >
                                    <UIcon
                                        name="i-heroicons-arrow-path"
                                        class="w-5 h-5 animate-spin text-gray-400"
                                    />
                                </div>

                                <div v-else>
                                    <div
                                        v-if="comments.length === 0"
                                        class="text-sm text-center text-gray-500"
                                    >
                                        {{
                                            $t("goals.noComments") ||
                                            "No comments yet."
                                        }}
                                    </div>

                                    <div
                                        v-else
                                        class="space-y-3 max-h-64 overflow-y-auto"
                                    >
                                        <div
                                            v-for="comment in comments"
                                            :key="comment.id"
                                            class="flex w-full gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                        >
                                            <UAvatar
                                                :src="
                                                    comment.user?.avatarUrl ??
                                                    undefined
                                                "
                                                :alt="comment.user?.username"
                                                size="sm"
                                            />
                                            <div class="flex-1 min-w-0">
                                                <div
                                                    class="flex items-center justify-between gap-2"
                                                >
                                                    <div
                                                        class="flex items-center gap-2"
                                                    >
                                                        <span
                                                            class="font-medium text-sm"
                                                            >{{
                                                                comment.user
                                                                    ?.name ||
                                                                comment.user
                                                                    ?.username
                                                            }}</span
                                                        >
                                                        <span
                                                            class="text-xs text-gray-500"
                                                            >{{
                                                                formatDateRelative(
                                                                    comment.createdAt
                                                                )
                                                            }}</span
                                                        >
                                                    </div>
                                                    <!-- Edit/Delete for comment owner -->
                                                    <div
                                                        v-if="
                                                            user &&
                                                            comment.user?.id ===
                                                                user.id
                                                        "
                                                        class="flex items-center gap-1"
                                                    >
                                                        <UButton
                                                            icon="i-heroicons-pencil"
                                                            variant="ghost"
                                                            color="neutral"
                                                            size="xs"
                                                            @click="
                                                                startEditComment(
                                                                    comment
                                                                )
                                                            "
                                                        />
                                                        <UButton
                                                            icon="i-heroicons-trash"
                                                            variant="ghost"
                                                            color="error"
                                                            size="xs"
                                                            @click="
                                                                deleteComment(
                                                                    comment.id
                                                                )
                                                            "
                                                            :loading="
                                                                deletingCommentId ===
                                                                comment.id
                                                            "
                                                        />
                                                    </div>
                                                </div>

                                                <!-- Edit Mode -->
                                                <div
                                                    v-if="
                                                        editingCommentId ===
                                                        comment.id
                                                    "
                                                    class="mt-2"
                                                >
                                                    <UTextarea
                                                        v-model="
                                                            editCommentContent
                                                        "
                                                        :rows="2"
                                                        class="w-full"
                                                    />
                                                    <div
                                                        class="flex gap-2 mt-2"
                                                    >
                                                        <UButton
                                                            size="xs"
                                                            @click="
                                                                saveEditComment(
                                                                    comment.id
                                                                )
                                                            "
                                                            :loading="
                                                                savingComment
                                                            "
                                                        >
                                                            {{
                                                                $t(
                                                                    "common.save"
                                                                )
                                                            }}
                                                        </UButton>
                                                        <UButton
                                                            size="xs"
                                                            variant="ghost"
                                                            @click="
                                                                cancelEditComment
                                                            "
                                                        >
                                                            {{
                                                                $t(
                                                                    "common.cancel"
                                                                )
                                                            }}
                                                        </UButton>
                                                    </div>
                                                </div>

                                                <!-- Normal Display -->
                                                <p
                                                    v-else
                                                    class="text-sm mt-1 break-words"
                                                >
                                                    {{ comment.content }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center text-sm text-gray-500">
                            {{
                                $t("goals.likesCommentsInfo") ||
                                "Click the icons above to view likes and comments."
                            }}
                        </div>
                    </div>

                    <!-- Add Comment -->
                    <template #footer v-if="showCommentsPanel">
                        <div class="flex gap-2">
                            <UTextarea
                                v-model="newComment"
                                :placeholder="
                                    String($t('goals.commentPlaceholder')) ||
                                    'Write a comment'
                                "
                                :rows="2"
                                class="flex-1"
                            />
                            <UButton
                                @click="submitComment"
                                :loading="submittingComment"
                                :disabled="!newComment.trim()"
                            >
                                {{ $t("goals.send") || "Send" }}
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </div>
        </div>

        <AppGoalsModalCreateUpdate
            v-model="isEditModalOpen"
            :goal="goal"
            @saved="onGoalSaved"
        />

        <!-- Delete Goal Modal -->
        <UModal
            v-model:open="isDeleteModalOpen"
            :title="String($t('goals.deleteGoal') || 'Delete Goal')"
        >
            <template #body>
                <p>
                    {{
                        $t("goals.deleteGoalConfirm") ||
                        "Are you sure you want to delete this goal? This action cannot be undone."
                    }}
                </p>
                <div class="flex justify-end gap-2 mt-4">
                    <UButton
                        color="neutral"
                        variant="ghost"
                        @click="isDeleteModalOpen = false"
                        >{{ $t("common.cancel") || "Cancel" }}</UButton
                    >
                    <UButton
                        color="error"
                        @click="deleteGoal"
                        :loading="deleting"
                        >{{ $t("goals.deleteGoal") || "Delete Goal" }}</UButton
                    >
                </div>
            </template>
        </UModal>

        <!-- Add Transaction Modal -->
        <UModal
            v-model:open="isDepositModalOpen"
            :title="
                String(
                    $t('goals.transaction.addTransaction') || 'Add Transaction'
                )
            "
        >
            <template #body>
                <UForm
                    :schema="transactionSchema"
                    :state="transactionState"
                    @submit="onTransactionSubmit"
                    class="space-y-4"
                >
                    <UFormField
                        :label="String($t('goals.transaction.type') || 'Type')"
                        name="type"
                    >
                        <URadioGroup
                            v-model="transactionState.type"
                            :items="transactionTypes"
                        />
                    </UFormField>

                    <UFormField
                        :label="
                            String($t('goals.transaction.amount') || 'Amount')
                        "
                        name="amount"
                        required
                    >
                        <UInput
                            v-model.number="transactionState.amount"
                            type="number"
                            placeholder="0.00"
                            autofocus
                        />
                    </UFormField>

                    <UFormField
                        :label="String($t('goals.transaction.note') || 'Note')"
                        name="note"
                    >
                        <UInput
                            v-model="transactionState.note"
                            :placeholder="
                                String(
                                    $t('goals.transaction.notePlaceholder') ||
                                        'Optional note'
                                )
                            "
                        />
                    </UFormField>

                    <div class="flex justify-end gap-2 mt-4">
                        <UButton
                            color="neutral"
                            variant="ghost"
                            @click="isDepositModalOpen = false"
                            >{{ $t("common.cancel") || "Cancel" }}</UButton
                        >
                        <UButton
                            type="submit"
                            color="primary"
                            :loading="loading"
                            >{{ $t("common.save") || "Save" }}</UButton
                        >
                    </div>
                </UForm>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";

definePageMeta({
    middleware: "auth",
});

const { $t } = useI18n();
const { formatDateRelative, formatDateFull, formatDateTimeFull } = useDate();
const route = useRoute();
const goalId = route.params.id;

// Fetch goal details
const {
    data: goal,
    refresh: refreshGoal,
    error,
} = await useFetch(`/api/v1/goals/${goalId}`);
const { data: transactions, refresh: refreshTransactions } = await useFetch(
    `/api/v1/goals/${goalId}/transactions`
);

// Delete Goal
const isDeleteModalOpen = ref(false);
const deleting = ref(false);
const isEditModalOpen = ref(false);

const deleteGoal = async () => {
    deleting.value = true;
    try {
        await $fetch(`/api/v1/goals/${goalId}`, {
            method: "DELETE",
        });

        toast.add({
            title: String(
                $t("goals.notify.deleteSuccessTitle") || "Goal Deleted"
            ),
            description: String(
                $t("goals.notify.deleteSuccessMessage") ||
                    "The goal has been successfully deleted."
            ),
            color: "success",
        });
        isDeleteModalOpen.value = false;
        navigateTo("/goals");
    } catch (error: any) {
        toast.add({
            title: String($t("goals.notify.deleteErrorTitle") || "Error"),
            description:
                error.statusMessage ||
                String(
                    $t("goals.notify.deleteErrorMessage") ||
                        "Failed to delete the goal."
                ),
            color: "error",
        });
    } finally {
        deleting.value = false;
    }
};

// Transaction Form
const isDepositModalOpen = ref(false);
const transactionSchema = z.object({
    amount: z
        .number({
            message: String(
                $t("goals.transaction.amountInvalid") ||
                    "Amount must be a number"
            ),
        })
        .positive(
            String(
                $t("goals.transaction.amountPositive") ||
                    "Amount must be positive"
            )
        ),
    type: z.enum(["DEPOSIT", "WITHDRAW"], {
        message: String(
            $t("goals.transaction.typeRequired") || "Type is required"
        ),
    }),
    note: z.string().optional(),
});
type TransactionSchema = z.output<typeof transactionSchema>;

const transactionState = reactive({
    amount: 0,
    type: "DEPOSIT" as const,
    note: "",
});

const transactionTypes = computed(() => [
    {
        value: "DEPOSIT",
        label: String($t("goals.transaction.deposit") || "Deposit (Save)"),
    },
    {
        value: "WITHDRAW",
        label: String($t("goals.transaction.withdraw") || "Withdraw"),
    },
]);

const loading = ref(false);
const toast = useToast();

async function onTransactionSubmit(event: FormSubmitEvent<TransactionSchema>) {
    loading.value = true;
    try {
        await $fetch(`/api/v1/goals/${goalId}/transactions`, {
            method: "POST",
            body: event.data,
        });
        toast.add({
            title: String($t("goals.transaction.successTitle") || "Success"),
            description: String(
                $t("goals.transaction.successMessage") || "Transaction recorded"
            ),
            color: "success",
        });
        isDepositModalOpen.value = false;
        transactionState.amount = 0;
        transactionState.note = "";
        refreshGoal();
        refreshTransactions();
    } catch (err: any) {
        toast.add({
            title: String($t("goals.transaction.errorTitle") || "Error"),
            description:
                err.data?.statusMessage ||
                err.message ||
                String(
                    $t("goals.transaction.errorMessage") ||
                        "Failed to record transaction"
                ),
            color: "error",
        });
    } finally {
        loading.value = false;
    }
}

const getProgress = (saved: number, target: number) => {
    if (!target) return 0;
    return Math.min(100, Math.round((saved / target) * 100));
};

const getDailyTarget = (saved: number, target: number, targetDate: string) => {
    const now = new Date();
    const endDate = new Date(targetDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return target - saved;
    return Math.max(0, (target - saved) / diffDays);
};

const copyLink = () => {
    const shareUrl = `${window.location.origin}/goals/share/${goal.value?.shareSlug}`;
    navigator.clipboard.writeText(shareUrl);
    toast.add({
        title: String(
            $t("goals.share.linkCopied") || "Link copied to clipboard!"
        ),
        description: String(
            $t("goals.share.linkCopiedDescription") ||
                "You can now share it with others."
        ),
    });
};

// Likes & Comments for public goals
const { user } = useAuth();

const showCommentsPanel = ref(false);
const comments = ref<any[]>([]);
const loadingComments = ref(false);
const newComment = ref("");
const submittingComment = ref(false);
const editingCommentId = ref<number | null>(null);
const editCommentContent = ref("");
const savingComment = ref(false);
const deletingCommentId = ref<number | null>(null);

// Likers
const showLikersPanel = ref(false);
const likers = ref<any[]>([]);
const loadingLikers = ref(false);

const toggleLikersPanel = async () => {
    const opening = !showLikersPanel.value;
    showLikersPanel.value = opening;

    if (opening) {
        showCommentsPanel.value = false;
        if (likers.value.length === 0) {
            await fetchLikers();
        }
    }
};

const fetchLikers = async () => {
    if (!goal.value) return;
    loadingLikers.value = true;
    try {
        const data = await $fetch<any[]>(`/api/v1/goals/${goalId}/likes`);
        likers.value = data || [];
    } catch (err: any) {
        toast.add({
            title: String($t("goals.notify.loadLikesErrorTitle") || "Error"),
            description:
                err?.data?.message ||
                String(
                    $t("goals.notify.loadLikesErrorMessage") ||
                        "Failed to load likers"
                ),
            color: "error",
        });
    } finally {
        loadingLikers.value = false;
    }
};

const toggleCommentsPanel = async () => {
    const opening = !showCommentsPanel.value;
    showCommentsPanel.value = opening;

    if (opening) {
        showLikersPanel.value = false;
        if (comments.value.length === 0) {
            await fetchComments();
        }
    }
};

const fetchComments = async () => {
    if (!goal.value) return;
    loadingComments.value = true;
    try {
        const data = await $fetch<any[]>(`/api/v1/goals/${goalId}/comments`);
        comments.value = data || [];
    } catch (err: any) {
        toast.add({
            title: String($t("goals.notify.loadCommentsErrorTitle") || "Error"),
            description:
                err?.data?.message ||
                String(
                    $t("goals.notify.loadCommentsErrorMessage") ||
                        "Failed to load comments"
                ),
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
    if (!newComment.value.trim() || !goal.value) return;

    submittingComment.value = true;
    try {
        const created = await $fetch(`/api/v1/goals/${goalId}/comments`, {
            method: "POST",
            body: { content: newComment.value },
        });

        comments.value.unshift(created);
        newComment.value = "";

        if (goal.value)
            goal.value.commentsCount = (goal.value.commentsCount || 0) + 1;

        toast.add({
            title: String(
                $t("goals.notify.addCommentSuccessTitle") || "Success"
            ),
            description: String(
                $t("goals.notify.addCommentSuccessMessage") ||
                    "Comment added successfully"
            ),
            color: "success",
        });
    } catch (err: any) {
        toast.add({
            title: String($t("goals.notify.addCommentErrorTitle") || "Error"),
            description:
                err?.data?.message ||
                String(
                    $t("goals.notify.addCommentErrorMessage") ||
                        "Failed to add comment"
                ),
            color: "error",
        });
    } finally {
        submittingComment.value = false;
    }
};

const startEditComment = (c: any) => {
    editingCommentId.value = c.id;
    editCommentContent.value = c.content;
};

const cancelEditComment = () => {
    editingCommentId.value = null;
    editCommentContent.value = "";
};

const saveEditComment = async (commentId: number) => {
    if (!editCommentContent.value.trim() || !goal.value) return;
    savingComment.value = true;
    try {
        const updated = await $fetch(
            `/api/v1/goals/${goalId}/comments/${commentId}`,
            {
                method: "PUT",
                body: { content: editCommentContent.value },
            }
        );
        const idx = comments.value.findIndex((c) => c.id === commentId);
        if (idx !== -1) comments.value[idx] = updated;
        cancelEditComment();
        toast.add({
            title: String(
                $t("goals.notify.updateCommentSuccessTitle") || "Success"
            ),
            description: String(
                $t("goals.notify.updateCommentSuccessMessage") ||
                    "Comment updated"
            ),
            color: "success",
        });
    } catch (err: any) {
        toast.add({
            title: String(
                $t("goals.notify.updateCommentErrorTitle") || "Error"
            ),
            description:
                err?.data?.message ||
                String(
                    $t("goals.notify.updateCommentErrorMessage") ||
                        "Failed to update comment"
                ),
            color: "error",
        });
    } finally {
        savingComment.value = false;
    }
};

const deleteComment = async (commentId: number) => {
    if (!goal.value) return;
    deletingCommentId.value = commentId;
    try {
        await $fetch(`/api/v1/goals/${goalId}/comments/${commentId}`, {
            method: "DELETE",
        });
        comments.value = comments.value.filter((c) => c.id !== commentId);
        if (goal.value)
            goal.value.commentsCount = Math.max(
                0,
                (goal.value.commentsCount || 1) - 1
            );
        toast.add({
            title: String(
                $t("goals.notify.deleteCommentSuccessTitle") || "Success"
            ),
            description: String(
                $t("goals.notify.deleteCommentSuccessMessage") ||
                    "Comment deleted"
            ),
            color: "success",
        });
    } catch (err: any) {
        toast.add({
            title: String(
                $t("goals.notify.deleteCommentErrorTitle") || "Error"
            ),
            description:
                err?.data?.message ||
                String(
                    $t("goals.notify.deleteCommentErrorMessage") ||
                        "Failed to delete comment"
                ),
            color: "error",
        });
    } finally {
        deletingCommentId.value = null;
    }
};

function onGoalSaved(updated: any) {
    refreshGoal();
}
</script>

<style scoped></style>
