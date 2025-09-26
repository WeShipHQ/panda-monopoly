import { Leaderboard } from "@/components/features/leaderboard/leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen flex flex-col gap-6 pt-28">
      <div className="max-w-5xl w-full mx-auto px-6 py-10">
        <Leaderboard />
      </div>
    </div>
  );
}
