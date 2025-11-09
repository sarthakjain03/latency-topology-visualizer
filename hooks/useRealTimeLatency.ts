import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchRealTimeLatencies = async () => {
  const response = await axios.get("/api/real-time-latencies");

  if (response?.data?.latencies) {
    return response?.data?.latencies;
  } else {
    throw new Error(response?.data?.errors?.[0]?.message);
  }
};

export const useRealTimeLatency = () => {
  return useQuery({
    queryKey: ["real-time-latencies"],
    queryFn: fetchRealTimeLatencies,
    refetchInterval: 7000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });
};
