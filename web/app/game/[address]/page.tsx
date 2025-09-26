import { LeftPanel } from "@/components/features/game-board/left-panel";
import { GameView } from "@/components/features/game-board/game-view";
import { RightPanel } from "@/components/features/game-board/right-panel";

export default function GamePage() {
  return (
    <div className="max-h-screen game-container w-full h-full overflow-hidden">
      <div
        style={{
          gridArea: "left",
        }}
        className="overflow-hidden h-screen"
      >
        <LeftPanel />
      </div>
      <div
        style={{
          gridArea: "center",
        }}
        className="bg-green-200 w-[55vw]"
      >
        <GameView />
      </div>
      <div
        style={{
          gridArea: "right",
        }}
      >
        <RightPanel />
      </div>
    </div>
  );
}
