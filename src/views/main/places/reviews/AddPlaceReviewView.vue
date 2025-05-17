<script setup lang="ts">
import classNames from "classnames";
import HeaderNavbar from "@components/common/HeaderNavbar.vue";
import { isAxiosError } from "axios";
</script>

<template>
    <HeaderNavbar nav-title="Tambah Ulasan" />

    <!-- TOAST -->
    <div class="toast-container position-fixed top-0 start-0 w-100 d-flex justify-content-center p-3" style="z-index: 9999;">
        <div ref="toastEl" class="toast w-100 text-bg-{{ alertType }} border-0 shadow rounded overflow-hidden" style="max-width: 600px;" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body text-black text-start">
                    {{ alertMessage }}
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"
                    aria-label="Close"></button>
            </div>
        </div>
    </div>

    <!-- star ratings -->
    <div class="d-flex justify-content-center mt-4 mb-4">
        <div class="rating d-flex gap-3">
            <i v-for="i of 5" @click="form.data.rating = i" :key="i" :class="classNames({
                'bi-star': form.data.rating <= i - 1,
                'bi-star-half': form.data.rating > i - 1 && form.data.rating < i,
                'bi-star-fill': form.data.rating >= i,
            })
                " class="bi text-warning"></i>
        </div>
    </div>

    <!-- content review  -->
    <div class="container-fluid">
        <div class="mb-3">
            <label class="form-label">Jelaskan penilaian anda<span class="text-danger">*</span></label>
            <textarea v-model="form.data.content" class="form-control" rows="8" required
                placeholder="Bagikan pengalaman anda di tempat ini!"></textarea>
        </div>
    </div>

    <!-- image review  -->
    <div class="container-fluid">
        <div class="mb-4">
            <input ref="fileImageInputGalerry" @change="uploadImagePlace" type="file" class="d-none" multiple
                accept="image/*" />
            <input ref="fileImageInputCamerra" @change="uploadImagePlace" type="file" class="d-none" capture="user"
                accept="image/*" />
            <div class="d-flex gap-2">
                <button @click="($refs.fileImageInputGalerry as HTMLInputElement).click()" type="button"
                    class="btn btn-sm btn-neutral border-base w-50 waves-effect waves-dark">
                    <span class="pe-2">
                        <i class="bi bi-images"></i>
                    </span>
                    <span>Tambahkan Foto</span>
                </button>
                <button @click="($refs.fileImageInputCamerra as HTMLInputElement).click()" type="button"
                    class="btn btn-sm btn-neutral border-base w-50 waves-effect waves-dark">
                    <span class="pe-2">
                        <i class="bi bi-camera-fill"></i>
                    </span>
                    <span>Ambil Gambar</span>
                </button>
            </div>
        </div>
    </div>
    <div class="mt-2 image-scrollable-x">
        <div class="d-flex gap-2 ps-2">
            <div v-for="file of images" :key="file.id" class="col-auto image-item rounded">
                <div @click="unusedPlaceImage(file.id)" class="close-button">
                    <i class="bi bi-x-circle"></i>
                </div>
                <img alt="..." :src="file.link" />
            </div>
            <div class="invisible">xxxx</div>
        </div>
    </div>

    <!-- post button -->
    <div class="container-fluid mt-4">
        <div class="d-grid w-100">
            <button @click="postReview()" :disabled="form.loading" type="button"
                class="btn btn-md btn-primary waves-effect waves-light">
                <span>Posting</span>
                <span v-if="form.loading">...</span>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { type AxiosResponse } from "axios";
import axios from "@/helpers/axios.helper";
import { type File } from "@/interfaces/File";
import {
    API_URL_FILE_MAP_CONTENTS,
    API_URL_PLACE_REVIEWS,
} from "@/constants/api-url";

export default {
    computed: {
        placeId(): string {
            return this.$route.params.placeId as string;
        },
    },

    methods: {
        async uploadImagePlace(event: Event) {
            const files = (event.target as HTMLInputElement).files;
            if (files === null) return;

            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                try {
                    const response: AxiosResponse = await axios.post(
                        API_URL_FILE_MAP_CONTENTS,
                        formData
                    );
                    const fileData = response.data.data as File;
                    this.images.push(fileData);
                    this.form.data.imageIds.push(fileData.id as never);
                } catch (error) {
                    console.error(error);
                }
            }
        },

        unusedPlaceImage(fileId: string) {
            this.form.data.imageIds = this.form.data.imageIds.filter(
                (id) => id !== fileId
            );
            this.images = this.images.filter((file) => file.id !== fileId);
        },

        showToast(message: string, type: "success" | "danger") {
            this.alertMessage = message;
            this.alertType = type;

            this.$nextTick(() => {
                const toast = new window.bootstrap.Toast(
                    this.$refs.toastEl as HTMLElement,
                    { delay: 3000 }
                );
                toast.show();
            });
        },

        async postReview() {
            try {
                this.form.loading = true;
                const url = `${API_URL_PLACE_REVIEWS}?placeId=${this.placeId}`;

                if (this.form.data.content.trim() === "") {
                    this.showToast("Ulasan harus diisi.", "danger");
                    this.form.loading = false;
                    return;
                }

                await axios.post(url, this.form.data);

                if (window.Android !== undefined) {
                    window.Android.showToast("Ulasan berhasil ditambahkan.");
                } else {
                    this.showToast("Ulasan berhasil ditambahkan.", "success");
                }

                this.$router.back();
            } catch (error) {
                if (isAxiosError(error) && error.response?.data?.message) {
                    this.showToast(error.response.data.message, "danger");
                } else {
                    this.showToast("Ulasan gagal ditambahkan.", "danger");
                }
                console.error(error);
            }
            this.form.loading = false;
        },
    },

    data() {
        return {
            form: {
                data: {
                    rating: 1,
                    content: "",
                    imageIds: [] as string[],
                },
                loading: false,
            },
            images: [] as File[],
            alertMessage: "",
            alertType: "success",
        };
    },
};
</script>

<style scoped lang="scss">
.rating {
    .bi {
        font-size: 40px;
    }
}

.image-scrollable-x {
    overflow-x: auto;
    white-space: nowrap;
    scroll-behavior: smooth;

    .image-item {
        position: relative;
        display: inline-block;
        width: 140px;
        height: 100px;
        border: 4px solid #fff;
        border-radius: 0.7rem !important;
        overflow: hidden;

        .close-button {
            position: absolute;
            right: 8px;
            top: 2px;
            color: gray;
            font-size: 18px;
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
}

.toast-container {
  margin-top: 70px;
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.toast {
  background-color: #f9e0e3;
  pointer-events: auto;
}

.toast-body {
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
  text-align: start;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
}

</style>
