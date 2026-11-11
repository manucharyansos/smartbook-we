import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * A business's public link follows its name, and the API still opens a business by an old link.
 * Once the business is loaded, show its current link in the address bar (keeping ?source=… and #…),
 * so it is the link people copy and share from now on.
 */
export function useCanonicalBusinessLink<T extends { slug?: string | null }>(
    prefix: "/book" | "/businesses",
    requestedSlug: string,
    business: T | undefined,
    queryKey: (slug: string) => readonly unknown[],
) {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const currentSlug = business?.slug ?? "";

    useEffect(() => {
        if (!business || !currentSlug || !requestedSlug || currentSlug === requestedSlug) return;
        // Reuse the loaded business, so the page does not flash a loading state.
        queryClient.setQueryData(queryKey(currentSlug), business);
        navigate(`${prefix}/${encodeURIComponent(currentSlug)}${location.search}${location.hash}`, { replace: true });
    }, [business, currentSlug, requestedSlug, prefix, queryKey, queryClient, navigate, location.search, location.hash]);
}
