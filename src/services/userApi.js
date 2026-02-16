// userApi.js
import { baseApi } from "./baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => "/users/me",
      providesTags: ["User"],
    }),
    getAllUsers: builder.query({
      query: () => "/users/all",
      providesTags: ["User"],
    }),
    createUser: builder.mutation({
      query: (data) => ({
        url: "/users/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    assignRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/users/assign-role/${id}`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["User"],
    }),
    toggleBlock: builder.mutation({
      query: (id) => ({
        url: `/users/block/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetMeQuery,
  useGetAllUsersQuery,
  useCreateUserMutation,
  useAssignRoleMutation,
  useToggleBlockMutation,
} = userApi;