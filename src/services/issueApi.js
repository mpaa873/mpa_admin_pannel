import { baseApi } from "./baseApi";

export const issueApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdHocIssues: builder.query({
            query: () => "/issues/admin/add-hoc",
            providesTags: ["Issue"],
        }),

        getAvailableIssues: builder.query({
            query: () => "/issues/admin/available",
            providesTags: ["Issue"],
        }),
        createAdHocIssue: builder.mutation({
            query: (newIssue) => ({
                url: "/issues/admin/add-hoc",
                method: "POST",
                body: newIssue,
            }),
            invalidatesTags: ["Issue"],
        }),
        updateAdHocIssue: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/issues/admin/add-hoc/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Issue"],
        }),
        deleteAdHocIssue: builder.mutation({
            query: (id) => ({
                url: `/issues/admin/add-hoc/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Issue"],
        }),
    }),
});

export const {
    useGetAdHocIssuesQuery,
    useCreateAdHocIssueMutation,
    useUpdateAdHocIssueMutation,
    useDeleteAdHocIssueMutation,
    useGetAvailableIssuesQuery,

} = issueApi;