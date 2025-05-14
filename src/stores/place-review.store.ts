import { defineStore } from 'pinia'
import { type AxiosResponse } from 'axios'
import axios from '@/helpers/axios.helper'
import { type PlaceReviewEntity } from '@/interfaces/PlaceReview'
import { API_URL_PLACE_REVIEWS, API_URL_PLACE_REVIEWS_MY_REVIEW } from '@/constants/api-url'

export interface PlaceReviewState {
    myReview: PlaceReviewEntity | null
    placeReviews: PlaceReviewEntity[]
}

export const usePlaceReviewStore = defineStore('place-review', {
    /**
     * States.
     */
    state: (): PlaceReviewState => ({
        myReview: null,
        placeReviews: []
    }),

    /**
     * Actions.
     */
    actions: {
        async getMyPlaceReview (placeId: string, clearState: boolean = false): Promise<void> {
            try {
                if (clearState) this.myReview = null
                const url = `${API_URL_PLACE_REVIEWS_MY_REVIEW}?placeId=${placeId}`
                const response: AxiosResponse = await axios.get(url)
                const data = response.data.data as PlaceReviewEntity | null
                this.myReview = data
            } catch (error) {
                console.error(error)
                this.myReview = null
            }
        },

        async getPlaceReviews (placeId: string, clearState: boolean = false): Promise<void> {
            try {
                if (clearState) this.placeReviews = []
                const url = `${API_URL_PLACE_REVIEWS}?placeId=${placeId}`
                const response: AxiosResponse = await axios.get(url)
                const data = response.data.data as PlaceReviewEntity[]
                this.placeReviews = data
            } catch (error) {
                console.error(error)
                this.placeReviews = []
            }
        }
    }
})

export default { usePlaceReviewStore }
