<script setup lang="ts">
import classNames from 'classnames'
import { toIdrCurrency } from '@/helpers/formater.helper'
</script>

<template>
    <div @click="toPlaceDetailView" class="card">
        <div class="card-box-img">
            <img v-lazy="imageCoverLink" alt="..." class="card-img">
            <div class="badge-absolute">
                <span class="badge bg-light text-dark border mb-2">
                    {{ placeDistance.toFixed(1) }} KM
                </span>
            </div>
        </div>
        <div class="card-body">
            <span class="badge bg-white text-dark border mb-2">
                {{ place.category.name }}
            </span>
            <h3 class="title h4">
                {{ place.name }}
            </h3>
            <p class="description">
                {{ place.description }}
            </p>
            <div class="list-info my-2">
                <div class="d-flex align-items-center">
                    <i class="bi bi-geo-alt-fill me-2 text-muted"></i>
                    <span class="text-sm text-heading text-primary-hover">
                        {{ place.address }}
                    </span>
                </div>
                <div class="d-flex align-items-center">
                    <i class="bi bi-alarm-fill me-2 text-muted"></i>
                    <div class="text-sm text-heading text-primary-hover">
                        <span :class="classNames({
                            'text-primary': (openingHoursStatus.open === true),
                            'text-danger': (openingHoursStatus.open === false),
                        })">{{ openingHoursStatus.content }}</span>
                    </div>
                </div>
            </div>
            <div class="rating d-flex gap-1">
                <i v-for="i of 5" :key="i" :class="classNames({
                    'bi-star': (place.rating <= i - 1),
                    'bi-star-half': (place.rating > i - 1 && place.rating < i),
                    'bi-star-fill': (place.rating >= i),
                })" class="bi text-warning"></i>
                <span>({{ place.rating.toFixed(2) }})</span>
            </div>
            <p class="price text-primary">
                {{ toIdrCurrency(place.price) }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { getDistance } from 'geolib'
import { type File } from '@/interfaces/File'
import { usePlaceStore } from '@/stores/place.store'
import { getPlaceOpenHourStatus } from '@/helpers/time.helper'
import { useGeolocationStore } from '@/stores/geolocation.store'
import { type OpeningHoursStatus, type OpeningHoursDay, type PlaceEntity } from '@/interfaces/Place'

export default {

    computed: {
        ...mapState(usePlaceStore, ['placeBookmarks']),
        ...mapState(useGeolocationStore, ['coordinates']),

        place (): PlaceEntity {
            return this.placeBookmarks.find(place => place.id === this.placeId) as PlaceEntity
        },

        placeDistance (): number {
            const distanceInMater = getDistance(
                { latitude: this.coordinates.latitude, longitude: this.coordinates.longitude },
                { latitude: this.place.latitude, longitude: this.place.longitude }
            )
            return distanceInMater / 1000
        },

        imageCoverLink (): string {
            if (this.place.mapImageCover === undefined) return ''
            const fileData = this.place.mapImageCover as unknown as File
            return fileData.link ?? ''
        },

        openingHoursStatus (): OpeningHoursStatus {
            const openingHours = this.place.openingHours.find(openingHours => openingHours.dayIndex === this.dayIndex) as OpeningHoursDay
            return getPlaceOpenHourStatus(openingHours)
        }
    },

    methods: {
        toPlaceDetailView () {
            this.$router.push({ name: 'place:detail', params: { placeId: this.placeId } })
        }
    },

    data () {
        return {
            dayIndex: new Date().getDay()
        }
    },

    props: {
        placeId: String
    }
}
</script>

<style scoped lang="scss">
.card {
    width: 250px;
    overflow: hidden;
    .card-box-img {
        position: relative;
        .card-img {
            border-radius: 0;
        }
        .badge-absolute {
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: 2;
        }
    }
    .card-body {
        padding: 16px;
        .title {
            font-weight: bold;
            overflow: hidden;
            text-overflow: ellipsis;
            text-wrap: nowrap;
        }
        .description {
            font-size: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .list-info {
            font-size: 12px;
        }
        .rating {
            font-size: 16px;
        }
        .price {
            font-size: 14px;
        }
    }
}
</style>

<style lang="scss">
.card.card-place-sm {
    border-radius: calc(var(--x-card-border-radius) - 0.1rem);
    .card-box-img {
        .badge-absolute {
            top: 10px;
            right: 10px;
            .badge {
                font-size: 10px;
            }
        }
    }
    .card-body {
        padding: 12px;
        .badge {
            font-size: 10px;
        }
        .title {
            font-size: 14px;
        }
        .description {
            font-size: 12px;
            white-space: nowrap;
        }
        .list-info {
            font-size: 12px;
        }
        .rating {
            font-size: 14px;
        }
        .price {
            font-size: 14px;
        }
    }
}
</style>
