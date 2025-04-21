"use client";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { getTasks, isTaskData } from "./task-data";
import { ItemList } from "./item-list";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge";
import { triggerPostMoveFlash } from "@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash";

export function List() {
  const [tasks, setTasks] = useState<any[]>(() => getTasks());

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isTaskData(source.data);
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }

        const sourceData = source.data;
        const targetData = target.data;

        if (!isTaskData(sourceData) || !isTaskData(targetData)) {
          return;
        }

        const indexOfSource = tasks.findIndex(
          (task) => task.id === sourceData.taskId
        );
        const indexOfTarget = tasks.findIndex(
          (task) => task.id === targetData.taskId
        );

        if (indexOfTarget < 0 || indexOfSource < 0) {
          return;
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData);

        flushSync(() => {
          setTasks(
            reorderWithEdge({
              list: tasks,
              startIndex: indexOfSource,
              indexOfTarget,
              closestEdgeOfTarget,
              axis: "vertical",
            })
          );
        });
        const element = document.querySelector(
          `[data-task-id="${sourceData.taskId}"]`
        );
        if (element instanceof HTMLElement) {
          triggerPostMoveFlash(element);
        }
      },
    });
  }, [tasks]);

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <ItemList key={task.id} task={task} />
      ))}
    </div>
  );
}
