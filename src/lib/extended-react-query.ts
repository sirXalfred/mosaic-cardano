import {
  useQuery,
  UseQueryOptions,
  QueryKey,
} from "@tanstack/react-query";

export function useXQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey
  >
) {
  const result = useQuery(options);

  return {
    ...result,
    is404Error:
      result.isError && result.error instanceof Error && result.error.message.toLowerCase().includes('not found'),
    isLoaded:
      result.status === "success",
  };
}