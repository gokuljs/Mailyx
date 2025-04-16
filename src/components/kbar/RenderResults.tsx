import { KBarResults, useMatches } from "kbar";
import React from "react";
import ResultItem from "./ResultItem";

const RenderResults = () => {
  const { results, rootActionId } = useMatches();
  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="px-4 py-2 text-sm text-gray-600 uppercase opacity-50 dark:text-gray-400">
            {item}
          </div>
        ) : (
          <ResultItem
            action={item}
            active={active}
            currentRootActionId={rootActionId ?? ""}
          />
        )
      }
    />
  );
};

export default RenderResults;
