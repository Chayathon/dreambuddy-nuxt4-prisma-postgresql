<template>
    <div class="container mx-auto px-4 py-8 max-w-2xl">
        <div class="mb-6">
            <UButton
                to="/goals"
                variant="ghost"
                icon="i-heroicons-arrow-left"
                >{{ $t("goals.backToGoals") }}</UButton
            >
            <h1 class="text-2xl font-bold mt-2">
                {{ $t("goals.createNewGoal") }}
            </h1>
        </div>

        <UCard>
            <UForm
                :schema="schema"
                :state="state"
                class="space-y-4"
                @submit="onSubmit"
            >
                <UFormField
                    :label="String($t('goals.goalTitle'))"
                    name="title"
                    required
                >
                    <UInput
                        v-model="state.title"
                        :placeholder="String($t('goals.goalTitlePlaceholder'))"
                        class="w-full"
                    />
                </UFormField>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField
                        :label="String($t('goals.targetAmount'))"
                        name="targetAmount"
                        required
                    >
                        <UInput
                            v-model.number="state.targetAmount"
                            type="number"
                            :placeholder="
                                String($t('goals.targetAmountPlaceholder'))
                            "
                            class="w-full"
                        />
                    </UFormField>

                    <UFormField
                        :label="String($t('goals.targetDate'))"
                        name="targetDate"
                        required
                    >
                        <UInput
                            v-model="state.targetDate"
                            type="date"
                            class="w-full"
                        />
                    </UFormField>
                </div>

                <UFormField
                    :label="String($t('goals.category'))"
                    name="category"
                >
                    <USelect
                        v-model="state.category"
                        :items="categories"
                        class="w-full"
                    />
                </UFormField>

                <UFormField
                    :label="String($t('goals.visibility'))"
                    name="visibility"
                >
                    <URadioGroup
                        v-model="state.visibility"
                        :items="visibilities"
                    />
                </UFormField>

                <UFormField
                    :label="String($t('goals.imageUrl'))"
                    name="imageUrl"
                >
                    <UInput
                        v-model="state.imageUrl"
                        placeholder="https://..."
                        class="w-full"
                    />
                </UFormField>

                <UFormField :label="String($t('goals.note'))" name="note">
                    <UTextarea
                        v-model="state.note"
                        :placeholder="String($t('goals.notePlaceholder'))"
                        class="w-full"
                    />
                </UFormField>

                <div class="flex justify-end pt-4">
                    <UButton type="submit" color="primary" :loading="loading">
                        {{ $t("goals.createGoal") }}
                    </UButton>
                </div>
            </UForm>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
const { $t, $localePath } = useI18n();

definePageMeta({
    middleware: "auth",
});

const schema = z.object({
    title: z.string().min(1, String($t("goals.validate.goalTitleRequired"))),
    targetAmount: z
        .number()
        .positive(String($t("goals.validate.amountMustBePositive"))),
    targetDate: z
        .string()
        .refine(
            (date) => new Date(date) > new Date(),
            String($t("goals.validate.dateMustBeInTheFuture"))
        ),
    category: z.string().optional(),
    visibility: z.enum(["PRIVATE", "PUBLIC", "LINK_ONLY"]),
    note: z.string().optional(),
    imageUrl: z
        .string()
        .url(String($t("goals.validate.invalidUrl")))
        .optional()
        .or(z.literal("")),
});

type Schema = z.output<typeof schema>;

const state = reactive({
    title: "",
    targetAmount: 0,
    targetDate: "",
    category: "General",
    visibility: "PRIVATE" as const,
    note: "",
    imageUrl: "",
});

const categories = [
    "General",
    "Travel",
    "Gadget",
    "Education",
    "Vehicle",
    "Home",
    "Emergency Fund",
    "Investment",
];
const visibilities = [
    { label: String($t("goals.private")), value: "PRIVATE" },
    { label: String($t("goals.public")), value: "PUBLIC" },
    { label: String($t("goals.linkOnly")), value: "LINK_ONLY" },
];

const loading = ref(false);
const toast = useToast();

async function onSubmit(event: FormSubmitEvent<Schema>) {
    loading.value = true;
    try {
        await $fetch("/api/v1/goals", {
            method: "POST",
            body: event.data,
        });
        toast.add({
            title: String($t("goals.createSuccessTitle") || "Success"),
            description: String(
                $t("goals.createSuccessMessage") || "Goal created successfully"
            ),
        });
        navigateTo("/goals");
    } catch (error: any) {
        toast.add({
            title: String($t("goals.createErrorTitle") || "Error"),
            description:
                error.statusMessage ||
                String(
                    $t("goals.createErrorMessage") || "Failed to create goal"
                ),
            color: "error",
        });
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped></style>
