// store/services/trackingApi.js
import { baseApi } from "./baseApi"; 

export const trackingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaperTracking: builder.query({
      query: (id) => `/paper-tracking/${id}`,
      providesTags: (result, error, id) => [{ type: 'Manuscripts', id }],
    }),
  }),
});

export const { useGetPaperTrackingQuery } = trackingApi;