<template>
    <div class="space-y-6">
        <!-- Success State -->
        <div v-if="isEmailSent" class="text-center space-y-6">
            <!-- Icon -->
            <div
                class="mx-auto w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"
            >
                <Icon
                    name="i-heroicons-envelope"
                    class="w-8 h-8 text-primary-600 dark:text-primary-400"
                />
            </div>

            <!-- Header -->
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                    {{ $t("auth.forgotPassword.checkEmail") }}
                </h1>
                <p class="mt-2 text-gray-600 dark:text-gray-400">
                    {{ $t("auth.forgotPassword.emailSent") }}
                    <span class="font-medium text-gray-900 dark:text-white">{{
                        state.email
                    }}</span>
                </p>
            </div>

            <!-- Instructions -->
            <div
                class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-left"
            >
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ $t("auth.forgotPassword.instructions") }}
                </p>
            </div>

            <!-- Actions -->
            <div class="space-y-3">
                <UButton
                    block
                    size="lg"
                    color="primary"
                    @click="$router.push($localePath('/auth/login'))"
                    class="cursor-pointer"
                >
                    {{ $t("auth.forgotPassword.backToLogin") }}
                </UButton>
                <UButton
                    block
                    size="lg"
                    variant="ghost"
                    @click="handleResendEmail"
                    class="cursor-pointer"
                    :loading="isLoading"
                    :disabled="isLoading"
                >
                    {{ $t("auth.forgotPassword.resendEmail") }}
                </UButton>
            </div>
        </div>

        <!-- Form State -->
        <div v-else>
            <!-- Header -->
            <div class="text-center lg:text-left">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                    {{ $t("auth.forgotPassword.title") }}
                </h1>
                <p class="mt-2 text-gray-600 dark:text-gray-400">
                    {{ $t("auth.forgotPassword.subtitle") }}
                </p>
            </div>

            <!-- Reset Form -->
            <UForm
                :schema="schema"
                :state="state"
                @submit="onSubmit"
                class="py-4 space-y-4"
            >
                <!-- Email -->
                <div>
                    <UFormField
                        :label="String($t('auth.forgotPassword.email'))"
                        name="email"
                    >
                        <UInput
                            id="email"
                            v-model="state.email"
                            type="email"
                            :placeholder="
                                String(
                                    $t('auth.forgotPassword.emailPlaceholder')
                                )
                            "
                            size="lg"
                            required
                            autocomplete="email"
                            class="w-full"
                        >
                            <template #leading>
                                <Icon
                                    name="i-heroicons-envelope"
                                    class="w-5 h-5 text-gray-400"
                                />
                            </template>
                        </UInput>
                    </UFormField>
                    <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {{ $t("auth.forgotPassword.emailHint") }}
                    </p>
                </div>

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
                    {{ $t("auth.forgotPassword.sendResetLink") }}
                </UButton>
            </UForm>

            <!-- Back to Login -->
            <div class="text-center mt-4">
                <NuxtLink
                    :to="$localePath('/auth/login')"
                    class="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                    <Icon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
                    {{ $t("auth.forgotPassword.backToLogin") }}
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import z from "zod";

const route = useRoute();
const { $t, $localePath } = useI18n();
const toast = useToast();

definePageMeta({
    layout: "auth",
    middleware: "guest",
});

useHead({
    title: $t("auth.forgotPassword.title") as string,
    meta: [
        {
            name: "description",
            content: $t("auth.forgotPassword.subtitle") as string,
        },
    ],
});

const showResetErrorToast = () => {
    const error = route.query.reset_error as string | undefined;
    if (!error) return;

    const messages = {
        no_token: {
            title: "auth.resetPassword.noTokenTitle",
            description: "auth.resetPassword.noTokenMessage",
        },
        invalid_token: {
            title: "auth.resetPassword.invalidTokenTitle",
            description: "auth.resetPassword.invalidTokenMessage",
        },
    };

    const msg = messages[error as keyof typeof messages];
    if (msg) {
        nextTick(() => {
            toast.add({
                title: String($t(msg.title)),
                description: String($t(msg.description)),
                color: "error",
                duration: 5000,
            });

            // Remove query param after showing toast
            navigateTo(
                { query: { ...route.query, reset_error: undefined } },
                { replace: true }
            );
        });
    }
};

onMounted(() => {
    showResetErrorToast();
});

const schema = z.object({
    email: z
        .string()
        .email(
            String($t("auth.forgotPassword.invalidEmail") || "Invalid email")
        ),
});

type Schema = z.output<typeof schema>;

const state = reactive({
    email: "",
});

const isLoading = ref(false);
const isEmailSent = ref(false);

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    event.preventDefault();
    isLoading.value = true;

    try {
        await $fetch("/api/v1/auth/forgot-password", {
            method: "POST",
            body: {
                email: state.email,
            },
        });

        toast.add({
            title: String($t("auth.forgotPassword.successTitle")),
            description: String($t("auth.forgotPassword.successMessage")),
            color: "success",
        });
        isEmailSent.value = true;
    } catch (error: any) {
        if (error.statusMessage === "Users not registered via email/password") {
            toast.add({
                title: String($t("auth.forgotPassword.errorTitle")),
                description: String(
                    $t("auth.forgotPassword.nonEmailUserMessage")
                ),
                color: "error",
                duration: 5000,
            });
            return;
        }

        toast.add({
            title: String($t("auth.forgotPassword.errorTitle")),
            description: String($t("auth.forgotPassword.errorMessage")),
            color: "error",
        });
    } finally {
        isLoading.value = false;
    }
};

const handleResendEmail = async () => {
    isLoading.value = true;

    try {
        await $fetch("/api/v1/auth/forgot-password", {
            method: "POST",
            body: {
                email: state.email,
            },
        });

        toast.add({
            title: String($t("auth.forgotPassword.successTitle")),
            description: String($t("auth.forgotPassword.successMessage")),
            color: "success",
        });
        isEmailSent.value = true;
    } catch (error) {
        toast.add({
            title: String($t("auth.forgotPassword.errorTitle")),
            description: String($t("auth.forgotPassword.errorMessage")),
            color: "error",
        });
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped></style>
