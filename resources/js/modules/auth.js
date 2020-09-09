import Vue from "vue";
import { VueAuthenticate } from "vue-authenticate";
import providers from "Services/providers";
const vueAuth = new VueAuthenticate(Vue.prototype.$http, providers);
import swal from "sweetalert2";

const state = {
  me: null,
  isAuthenticated: false
};

const getters = {
  getMe: state => state.me,
  isAuthenticated: () => vueAuth.isAuthenticated()
};

const actions = {
  /* Tested Working */
  /* form : name, email ,password, password_confirmation */
  async register({ commit, dispatch }, form) {
    form.busy = true;
    try {
      await vueAuth.register(form).then(() => {
        commit("isAuthenticated", {
          isAuthenticated: vueAuth.isAuthenticated()
        });
      });

      await dispatch("fetchMe");

      form.busy = false;
      vm.$router.push({ name: "dashboard" });
    } catch ({ errors, message }) {
      form.errors.set(errors);
      form.busy = false;
    }
  },
  /* Tested Working */
  /* form : username ,password */
  async login({ commit, dispatch }, form) {
    form.busy = true;
    try {
      await vueAuth.login(form).then(() => {
        commit("isAuthenticated", {
          isAuthenticated: vueAuth.isAuthenticated()
        });
      });

      await dispatch("fetchMe");

      form.busy = false;
      vm.$router.push({ name: "dashboard" });
    } catch (error) {
      form.errors.set(error.response.data.errors);
      form.busy = false;
      if (error.response.status === 401) {
        let modal = swal.mixin({
          confirmButtonClass: "v-btn blue-grey  subheading white--text",
          buttonsStyling: false
        });
        modal.fire({
          title: `${error.response.data.error}`,
          html: `<p class="title">${error.response.data.message}</p>`,
          type: "error",
          confirmButtonText: "Back"
        });
      }
    }
  },
  /* form : name,email ,provider(fb),provider_user_id(fb_id) */
  async socialauth({ commit, dispatch }, form) {
    form.busy = true;
    try {
      await App.post(route("api.auth.social"), form).then(() => {
        commit("isAuthenticated", {
          isAuthenticated: vueAuth.isAuthenticated()
        });
      });

      await dispatch("fetchMe");
      form.busy = false;

      vm.$router.push({ name: "dashboard" });
    } catch ({ errors, message }) {
      form.errors.set(errors);
      form.busy = false;
    }
  },
  /* Tested Working */
  /* Remove Access Token Cookie */
  async logout({ commit }, form) {
    form.busy = true;
    try {
      await vueAuth.logout().then(() => {
        commit("isAuthenticated", {
          isAuthenticated: vueAuth.isAuthenticated()
        });
        commit("setMe", null);
      });

      form.busy = false;
      vm.$router.push({ name: "home" });
    } catch ({ errors, message }) {
      form.busy = false;
    }
  },
  /* Tested Working */
  /* Get User Profile , Roles and Permissions */
  async fetchMe({ commit }) {
    try {
      const payload = await axios.post(route("api.@me"));
      commit("setMe", payload.data.data);
    } catch ({ errors, message }) {
      if (errors) {
        console.log(errors);
      }
      if (message) {
        console.log(message);
      }
    }
  },
  /* Tested Working */
  /* form : username ,password, password_confirmation, token */
  async passwordreset({ commit, dispatch }, form) {
    form.busy = true;
    try {
      await form.post(route("api.auth.reset-password")).then(response => {
        commit("isAuthenticated", {
          isAuthenticated: vueAuth.isAuthenticated()
        });
      });
      await dispatch("fetchMe");
      vm.$router.push({ name: "dashboard" });
    } catch (error) {
      form.busy = false;
      if (error.response.status) {
        let modal = swal.mixin({
          confirmButtonClass: "v-btn blue-grey  subheading white--text",
          buttonsStyling: false
        });
        modal.fire({
          title: `${error.response.status} Error!`,
          html: `<p class="title">${error.response.data.message}</p>`,
          type: "error",
          confirmButtonText: "Back"
        });
      }
    }
  }
  //! Not working as expected only showing empty popup
  /* form : name,email ,provider(fb),provider_user_id(fb_id) */
  /* async oauthLogin ({ commit, dispatch,state }, { provider, form, redirectUri } = payload) {
        form.busy = true
        let user = state.me
        vueAuth.options.providers[provider].url = `/auth/${provider}/user/${user.id}/login`
        let requestOptions = {}
        requestOptions.method = 'POST'
        // vueAuth.options.providers[provider].redirectUri = redirectUri
        vueAuth.options.providers[provider].popupOptions = { width: 0, height: 0 }
        try {
            await vueAuth.authenticate(provider,form,requestOptions).then((response) => {
                console.log(response)
            })
            form.busy = false
            vm.$popup({ message: 'Successfully Logged In!', backgroundColor: '#4db6ac', delay: 5, color: '#fffffa' })
        } catch ({errors, message}) {
            form.errors.set(errors)
            form.busy = false
            vm.$popup({ message: message, backgroundColor: '#e57373', delay: 5, color: '#fffffa' })
        }
    }
    */
};

const mutations = {
  setMe: (state, payload) => {
    state.me = payload;
  },
  isAuthenticated: (state, payload) => {
    state.isAuthenticated = payload.isAuthenticated;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};