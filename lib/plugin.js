import Vue from 'vue'
import Middleware from './middleware'

Middleware.oidc = async ({ $oidc, req }) => {
    $oidc.setUser(req.isAuthenticated() ? req.user : {})
}

class Oidc {
    constructor(ctx) {
        this.ctx = ctx

        Vue.set(this, 'state', {})
        this.setUser({})
    }

    get user() {
        return this.state.user
    }

    get isLoggedIn() {
        return this.state.isLoggedIn
    }

    setUser(user) {
        Vue.set(this.state, 'user', user)
        Vue.set(this.state, 'isLoggedIn', Object.keys(user).length > 0)
    }

    async fetchUser() {
        const { data, pending, refresh, error } = await useFetch('/oidc/user')
        console.log(data.value)
        this.setUser(data.value)
        if (error.value) {
            console.log(error.value)
            console.error(`[nuxt-oidc] failed to fetch user data: ${err.message}`)
            this.setUser({})
        }
    }

    login(redirect = '/') {
        if (process.client) {
            const params = new URLSearchParams({ redirect });
            window.location.replace('/oidc/login?' + params.toString())
        }
    }

    logout() {
        if (process.client) {
            window.location.replace('/oidc/logout')
        }
    }
}

export default async function (ctx, inject) {
    const $oidc = new Oidc(ctx)

    inject('oidc', $oidc)
    ctx.$oidc = $oidc

    if (process.client) {
        await $oidc.fetchUser()
    }
}
