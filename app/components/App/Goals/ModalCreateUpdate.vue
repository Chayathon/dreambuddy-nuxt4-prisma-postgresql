<template>
    <UModal
        :open="modelValue"
        @update:open="updateOpen"
        :title="
            mode === 'update'
                ? String($t('goals.editGoal'))
                : String($t('goals.createNewGoal'))
        "
    >
        <template #body>
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
                        {{
                            mode === "update"
                                ? $t("goals.updateGoal")
                                : $t("goals.createGoal")
                        }}
                    </UButton>
                </div>
            </UForm>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import { reactive, ref, watch, computed } from "vue";
import type { FormSubmitEvent } from "#ui/types";

const { $t } = useI18n();

const props = defineProps<{
    modelValue: boolean;
    goal?: any;
}>();

const emits = defineEmits<{
    (e: "update:modelValue", value: boolean): void;
    (e: "saved", goal: any): void;
}>();

function updateOpen(val: boolean) {
    emits("update:modelValue", val);
}

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

const defaultState = () => ({
    title: "",
    targetAmount: 0,
    targetDate: "",
    category: "General",
    visibility: "PRIVATE" as const,
    note: "",
    imageUrl: "",
});

const state = reactive<Schema & { [k: string]: any }>(defaultState());

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

const mode = computed(() => (props.goal ? "update" : "create"));

function fillStateFromGoal(goal: any) {
    if (!goal) {
        Object.assign(state, defaultState());
        return;
    }
    state.title = goal.title ?? "";
    state.targetAmount = Number(goal.targetAmount ?? 0);
    state.targetDate = goal.targetDate ? goal.targetDate.split("T")[0] : "";
    state.category = goal.category ?? "General";
    state.visibility = goal.visibility ?? "PRIVATE";
    state.note = goal.note ?? "";
    state.imageUrl = goal.imageUrl ?? "";
}

watch(
    () => props.goal,
    (g) => fillStateFromGoal(g),
    { immediate: true }
);

function close() {
    emits("update:modelValue", false);
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
    loading.value = true;
    try {
        if (props.goal && props.goal.id) {
            const updated = await $fetch(`/api/v1/goals/${props.goal.id}`, {
                method: "PUT",
                body: event.data,
            });
            toast.add({
                title: String(
                    $t("goals.notify.updateSuccessTitle") || "Success"
                ),
                description: String(
                    $t("goals.notify.updateSuccessMessage") || "Goal updated"
                ),
            });
            emits("saved", updated);
        } else {
            const created = await $fetch("/api/v1/goals", {
                method: "POST",
                body: event.data,
            });
            toast.add({
                title: String(
                    $t("goals.notify.createSuccessTitle") || "Success"
                ),
                description: String(
                    $t("goals.notify.createSuccessMessage") ||
                        "Goal created successfully"
                ),
            });
            emits("saved", created);
        }
        close();
    } catch (error: any) {
        toast.add({
            title: String($t("goals.notify.createErrorTitle") || "Error"),
            description:
                error.statusMessage ||
                String(
                    $t("goals.notify.createErrorMessage") ||
                        "Failed to save goal"
                ),
            color: "error",
        });
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.overlay-fade-enter-active,
.overlay-fade-leave-active {
    transition: opacity 200ms ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
    opacity: 0;
}
.overlay-fade-enter-to,
.overlay-fade-leave-from {
    opacity: 1;
}

.panel-scale-enter-active,
.panel-scale-leave-active {
    transition: opacity 200ms ease, transform 200ms ease;
}
.panel-scale-enter-from,
.panel-scale-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
}
.panel-scale-enter-to,
.panel-scale-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}
/* UModal handles overlay/panel transitions; no custom styles needed */
</style>
