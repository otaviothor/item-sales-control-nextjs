const taskDataKey = Symbol("task");

export function getTaskData(task: { id: any }) {
  return { [taskDataKey]: true, taskId: task.id };
}

export function isTaskData(data: Record<string | symbol, unknown>): any {
  return data[taskDataKey] === true;
}

export function getTasks() {
  return [
    { id: "0", content: "0000000000" },
    { id: "1", content: "1111111111" },
    { id: "2", content: "2222222222" },
  ];
}
