import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { type HTMLAttributes, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { DropIndicator } from "./drop-indicator";
import { getTaskData, isTaskData } from "./task-data";

type TaskState =
  | {
      type: "idle";
    }
  | {
      type: "preview";
      container: HTMLElement;
    }
  | {
      type: "is-dragging";
    }
  | {
      type: "is-dragging-over";
      closestEdge: Edge | null;
    };

const stateStyles: {
  [Key in TaskState["type"]]?: HTMLAttributes<HTMLDivElement>["className"];
} = {
  "is-dragging": "opacity-40",
};

const idle: TaskState = { type: "idle" };

export function ItemList({ task }: { task: any }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TaskState>(idle);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    return combine(
      draggable({
        element,
        getInitialData() {
          return getTaskData(task);
        },
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: pointerOutsideOfPreview({
              x: "16px",
              y: "8px",
            }),
            render({ container }) {
              setState({ type: "preview", container });
            },
          });
        },
        onDragStart() {
          setState({ type: "is-dragging" });
        },
        onDrop() {
          setState(idle);
        },
      }),
      dropTargetForElements({
        element,
        canDrop({ source }) {
          if (source.element === element) {
            return false;
          }

          return isTaskData(source.data);
        },
        getData({ input }) {
          const data = getTaskData(task);
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          });
        },
        getIsSticky() {
          return true;
        },
        onDragEnter({ self }) {
          const closestEdge = extractClosestEdge(self.data);
          setState({ type: "is-dragging-over", closestEdge });
        },
        onDrag({ self }) {
          const closestEdge = extractClosestEdge(self.data);

          setState((current) => {
            if (
              current.type === "is-dragging-over" &&
              current.closestEdge === closestEdge
            ) {
              return current;
            }
            return { type: "is-dragging-over", closestEdge };
          });
        },
        onDragLeave() {
          setState(idle);
        },
        onDrop() {
          setState(idle);
        },
      })
    );
  }, [task]);

  return (
    <>
      <div className="relative">
        <div
          data-task-id={task.id}
          ref={ref}
          className={`flex text-sm flex-row items-center border border-solid rounded p-2 hover:bg-stone-400 duration-100 hover:cursor-grab ${
            stateStyles[state.type] ?? ""
          }`}
        >
          <span className="truncate flex-grow flex-shrink">{task.content}</span>
        </div>
        {state.type === "is-dragging-over" && state.closestEdge ? (
          <DropIndicator edge={state.closestEdge} gap={"12px"} />
        ) : null}
      </div>
      {state.type === "preview"
        ? createPortal(<DragPreview task={task} />, state.container)
        : null}
    </>
  );
}

function DragPreview({ task }: { task: any }) {
  return <div className="border-solid rounded p-2">{task.content}</div>;
}
