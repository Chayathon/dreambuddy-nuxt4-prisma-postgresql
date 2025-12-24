<template>
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">{{ $t("goals.myGoals") }}</h1>
            <UButton
                @click="isCreateModalOpen = true"
                icon="i-heroicons-plus"
                color="primary"
            >
                {{ $t("goals.newGoal") }}
            </UButton>
        </div>

        <div v-if="goals?.length === 0" class="text-center py-12 text-gray-500">
            <p>{{ $t("goals.noGoalsMessage") }}</p>
            <UButton
                @click="isCreateModalOpen = true"
                variant="link"
                class="mt-2"
            >
                {{ $t("goals.createGoal") }}
            </UButton>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UCard
                v-for="goal in goals"
                :key="goal.id"
                class="hover:shadow-lg transition-shadow cursor-pointer"
                @click="navigateTo(`/goals/${goal.id}`)"
            >
                <template #header>
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-semibold">
                                {{ goal.title }}
                            </h3>
                            <p class="text-sm text-gray-500">
                                {{ goal.category || "Uncategorized" }}
                            </p>
                        </div>
                        <div class="text-right">
                            <UBadge
                                :color="
                                    goal.visibility === 'PRIVATE'
                                        ? 'neutral'
                                        : goal.visibility === 'PUBLIC'
                                        ? 'success'
                                        : 'warning'
                                "
                                size="sm"
                            >
                                {{ goal.visibility }}
                            </UBadge>
                            <p class="text-sm text-gray-500 mt-1">
                                {{
                                    new Date(
                                        goal.targetDate
                                    ).toLocaleDateString()
                                }}
                            </p>
                        </div>
                    </div>
                </template>

                <div class="space-y-4">
                    <div
                        v-if="goal.imageUrl"
                        class="aspect-video rounded-lg overflow-hidden bg-gray-100"
                    >
                        <img
                            :src="goal.imageUrl"
                            alt="Goal image"
                            class="w-full h-full object-cover"
                        />
                    </div>

                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span>{{ $t("goals.progress") }}</span>
                            <span class="font-medium"
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
                            color="primary"
                        />
                    </div>

                    <div class="flex justify-between text-sm">
                        <div>
                            <p class="text-gray-500">{{ $t("goals.saved") }}</p>
                            <p class="font-semibold">
                                {{ Number(goal.savedAmount).toLocaleString() }}
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="text-gray-500">
                                {{ $t("goals.target") }}
                            </p>
                            <p class="font-semibold">
                                {{ Number(goal.targetAmount).toLocaleString() }}
                            </p>
                        </div>
                    </div>

                    <div
                        class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                    >
                        <div class="flex items-center justify-between">
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
            </UCard>
        </div>
        <AppGoalsModalCreateUpdate
            v-model="isCreateModalOpen"
            @saved="onSaved"
        />
    </div>
</template>

<script setup lang="ts">
useHead({
    title: "My Goals",
    meta: [
        {
            name: "description",
            content: "View and manage your personal goals.",
        },
    ],
});

definePageMeta({
    middleware: "auth",
});

const { data: goals, refresh } = await useFetch("/api/v1/goals");
const isCreateModalOpen = ref(false);

function onSaved() {
    refresh();
}

const getProgress = (saved: number, target: number) => {
    if (target === 0) return 0;
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
</script>

<style scoped></style>
