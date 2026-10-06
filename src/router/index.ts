import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
    { path: '/', redirect: '/compress' },
    { path: '/:op(compress|merge|convert|audio-convert|cut)', component: () => import('@/views/ToolsView.vue') },
    { path: '/install', component: () => import('@/views/InstallView.vue') },
    { path: '/faq', component: () => import('@/views/FaqView.vue') },
    { path: '/about', component: () => import('@/views/AboutView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/compress' },
]

export default createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior() {
        return { top: 0 }
    },
})