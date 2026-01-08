<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="text-center lg:text-left">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ $t("auth.resetPassword.title") }}
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
                {{ $t("auth.resetPassword.subtitle") }}
            </p>
        </div>

        <!-- Reset Form -->
        <UForm
            :schema="schema"
            :state="state"
            @submit="onSubmit"
            class="space-y-4"
        >
            <!-- Password -->
            <UFormField
                name="password"
                type="password"
                :label="String($t('auth.resetPassword.newPasswordLabel'))"
                autocomplete="new-password"
            >
                <UInput
                    id="password"
                    v-model="state.password"
                    :placeholder="
                        String($t('auth.resetPassword.newPasswordPlaceholder'))
                    "
                    type="password"
                    size="lg"
                    required
                    class="w-full"
                >
                    <template #leading>
                        <Icon
                            name="i-heroicons-lock-closed"
                            class="w-5 h-5 text-gray-400"
                        />
                    </template>
                </UInput>
            </UFormField>

            <!-- Confirm Password -->
            <UFormField
                name="confirmPassword"
                type="password"
                :label="
                    String($t('auth.resetPassword.confirmNewPasswordLabel'))
                "
                autocomplete="new-password"
            >
                <UInput
                    id="confirmPassword"
                    v-model="state.confirmPassword"
                    :placeholder="
                        String(
                            $t(
                                'auth.resetPassword.confirmNewPasswordPlaceholder'
                            )
                        )
                    "
                    type="password"
                    size="lg"
                    required
                    class="w-full"
                >
                    <template #leading>
                        <Icon
                            name="i-heroicons-lock-closed"
                            class="w-5 h-5 text-gray-400"
                        />
                    </template>
                </UInput>
            </UFormField>

            <!-- Submit Button -->
            <UButton
                type="submit"
                block
                size="lg"
                color="primary"
                :loading="isLoading"
                :disabled="isLoading"
                class="cursor-pointer"
            >
                {{ $t("auth.resetPassword.resetPasswordButton") }}
            </UButton>
        </UForm>
    </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

const { $t, $localePath } = useI18n();
const toast = useToast();
const route = useRoute();

definePageMeta({
    layout: "auth",
    middleware: ["guest", "check-reset-token"],
});

useHead({
    title: $t("auth.resetPassword.title") as string,
    meta: [
        {
            name: "description",
            content: $t("auth.resetPassword.subtitle") as string,
        },
    ],
});

const schema = z
    .object({
        password: z
            .string()
            .min(
                6,
                String(
                    $t("auth.resetPassword.passwordTooShort") ||
                        "Password must be at least 6 characters"
                )
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: String(
            $t("auth.resetPassword.passwordsDoNotMatch") ||
                "Passwords do not match"
        ),
        path: ["confirmPassword"],
    });

type Schema = z.output<typeof schema>;

const state = reactive({
    password: "",
    confirmPassword: "",
});

const isLoading = ref(false);

const token = computed(() => route.query.token as string | undefined);

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    isLoading.value = true;

    try {
        await $fetch("/api/v1/auth/reset-password", {
            method: "POST",
            body: {
                token: token.value,
                newPassword: event.data.password,
            },
        });

        toast.add({
            title: String($t("auth.resetPassword.successTitle")),
            description: String($t("auth.resetPassword.successMessage")),
            color: "success",
        });

        await navigateTo($localePath("/auth/login"));
    } catch (error) {
        toast.add({
            title: String($t("auth.resetPassword.errorTitle")),
            description: String($t("auth.resetPassword.errorMessage")),
            color: "error",
        });
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped></style>
