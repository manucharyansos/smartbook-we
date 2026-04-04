import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { fetchFeatures, hasFeature } from "../lib/featuresApi";
import { FullScreenLoader } from "./ui/FullScreenLoader";

export function RequireFeature(props: { feature: string; children: React.ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["features"],
    queryFn: fetchFeatures,
    staleTime: 60_000,
  });

  if (isLoading) {
    return <FullScreenLoader title="Բեռնում է…" subtitle="Ստուգում ենք հնարավորությունները" />;
  }

  if (!hasFeature(data, props.feature)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{props.children}</>;
}
