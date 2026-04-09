import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3500,
        open: false,
        fs: {
            // Разрешаем доступ к src/assets через dev сервер
            allow: [".."],
        },
    },
    build: {
        outDir: "build",
    },
    // Папка public — Vite раздаёт её содержимое как статику
    // Просто перенеси src/assets/dota2 → public/assets/dota2
    publicDir: "public",
});