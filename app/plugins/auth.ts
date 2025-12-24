export default defineNuxtPlugin(async () => {
    const { fetchUser } = useAuth();

    // โหลดข้อมูลผู้ใช้จาก session ทุกครั้งที่เริ่มแอป (SSR + Client)
    await fetchUser();
});
