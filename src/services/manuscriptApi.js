import { baseApi } from "./baseApi";

export const manuscriptApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        submitManuscript: builder.mutation({
            query: (formData) => ({
                url: "/manuscripts/submit",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Manuscripts"],
        }),

        getMySubmissions: builder.query({
            query: () => "/manuscripts/my-submissions",
            providesTags: ["Manuscripts"],
        }),

        getAllSubmissions: builder.query({
            query: ({ page = 1, limit = 10 } = {}) =>
                `/manuscripts/admin/all?page=${page}&limit=${limit}`,
            providesTags: ["Manuscripts"],
        }),

        assignEditor: builder.mutation({
            query: (data) => ({
                url: "/manuscripts/admin/assign-editor",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Manuscripts"],
        }),

        updateStatus: builder.mutation({
            query: (formData) => ({
                url: "/manuscripts/admin/update-status",
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Manuscripts"],
        }),

        assignReviewers: builder.mutation({
            query: (data) => ({
                url: "/manuscripts/admin/assign-reviewers",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Manuscripts", "Review"],
        }),

        inviteReviewer: builder.mutation({
            query: (data) => ({
                url: "/manuscripts/admin/invite-reviewer",
                method: "POST",
                body: data,
            }),
        }),
        getAssignedToEditor: builder.query({
            query: (data) => ({
                url: "/manuscripts/editor/assignments",
                method: "GET",
            }),
            providesTags: ["Manuscripts"],
        }),
        updateSubmissionStatus: builder.mutation({
            query: (data) => {
                return {
                    url: "/manuscripts/admin/update-status",
                    method: "PUT",
                    body: data,
                };
            },
            invalidatesTags: ["Manuscripts", "Review"],
        }),
        editManuscriptAdmin: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/manuscripts/admin/edit/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Manuscripts"],
        }),

        deleteManuscriptAdmin: builder.mutation({
            query: (id) => ({
                url: `/manuscripts/admin/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Manuscripts"],
        }),
        getManuscriptById: builder.query({
            query: (id) => `/manuscripts/${id}`,
            providesTags: ["Manuscripts"],
        }),
        toggleEditorChoice: builder.mutation({
            query: (id) => ({
                url: `/manuscripts/admin/toggle-editor-choice/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["Manuscripts"],
        }),
    }),
});

export const {
    useSubmitManuscriptMutation,
    useGetMySubmissionsQuery,
    useGetAllSubmissionsQuery,
    useAssignEditorMutation,
    useUpdateStatusMutation,
    useAssignReviewersMutation,
    useInviteReviewerMutation,
    useGetAssignedToEditorQuery,
    useUpdateSubmissionStatusMutation,
    useEditManuscriptAdminMutation,
    useDeleteManuscriptAdminMutation,
    useGetManuscriptByIdQuery,
    useToggleEditorChoiceMutation,
} = manuscriptApi;