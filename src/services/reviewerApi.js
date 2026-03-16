import { baseApi } from "./baseApi";

export const reviewerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviewerAssignments: builder.query({
      query: () => "/reviews/my-assignments",
      providesTags: ["Review"],
    }),
    respondToInvitation: builder.mutation({
      query: (data) => ({
        url: "/reviews/respond",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Review"],
    }),
    submitReview: builder.mutation({
      query: ({ reviewId, formData }) => ({
        url: `/reviews/submit/${reviewId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Review"],
    }),
    getAdminReviewTracking: builder.query({
      query: () => "/reviews/admin-review-tracking",
      providesTags: ["Review"],
    }),
    getEligibleReviewers: builder.query({
      query: (manuscriptId) => `/reviews/eligible-reviewers/${manuscriptId}`,
      providesTags: ["Review"],
    }),

  }),
});

export const {
  useGetReviewerAssignmentsQuery,
  useRespondToInvitationMutation,
  useSubmitReviewMutation,
  useGetAdminReviewTrackingQuery,
  useGetEligibleReviewersQuery,
} = reviewerApi;