import { describe, it, expect, beforeEach } from "vitest";
import { useTaskStore } from "../taskStore";

// Reset store before each test
beforeEach(() => {
  useTaskStore.setState({ tasks: [] });
});

describe("taskStore", () => {
  describe("addTask", () => {
    it("adds a task and returns its id", () => {
      const id = useTaskStore.getState().addTask({
        title: "Test task",
        category: "travail",
        priority: "moyenne",
      });

      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);

      const tasks = useTaskStore.getState().tasks;
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe("Test task");
      expect(tasks[0].status).toBe("todo");
      expect(tasks[0].id).toBe(id);
    });

    it("sets createdAt automatically", () => {
      const before = new Date().toISOString();
      useTaskStore.getState().addTask({
        title: "Task",
        category: "perso",
        priority: "haute",
      });
      const after = new Date().toISOString();

      const task = useTaskStore.getState().tasks[0];
      expect(task.createdAt >= before).toBe(true);
      expect(task.createdAt <= after).toBe(true);
    });

    it("preserves optional fields", () => {
      useTaskStore.getState().addTask({
        title: "With extras",
        category: "admin",
        priority: "basse",
        deadline: "2026-12-31",
        description: "Some notes",
        estimatedPomodoros: 3,
        source: "braindump",
        projectId: "proj-1",
      });

      const task = useTaskStore.getState().tasks[0];
      expect(task.deadline).toBe("2026-12-31");
      expect(task.description).toBe("Some notes");
      expect(task.estimatedPomodoros).toBe(3);
      expect(task.source).toBe("braindump");
      expect(task.projectId).toBe("proj-1");
    });
  });

  describe("addTasks", () => {
    it("adds multiple tasks at once", () => {
      useTaskStore.getState().addTasks([
        { title: "Task 1", category: "travail", priority: "haute" },
        { title: "Task 2", category: "perso", priority: "basse" },
      ]);

      const tasks = useTaskStore.getState().tasks;
      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe("Task 1");
      expect(tasks[1].title).toBe("Task 2");
    });
  });

  describe("toggleTask", () => {
    it("toggles todo to done", () => {
      const id = useTaskStore.getState().addTask({
        title: "Toggle me",
        category: "travail",
        priority: "moyenne",
      });

      useTaskStore.getState().toggleTask(id);

      const task = useTaskStore.getState().tasks[0];
      expect(task.status).toBe("done");
      expect(task.completedAt).toBeDefined();
    });

    it("toggles done back to todo", () => {
      const id = useTaskStore.getState().addTask({
        title: "Toggle me",
        category: "travail",
        priority: "moyenne",
      });

      useTaskStore.getState().toggleTask(id);
      useTaskStore.getState().toggleTask(id);

      const task = useTaskStore.getState().tasks[0];
      expect(task.status).toBe("todo");
      expect(task.completedAt).toBeUndefined();
    });
  });

  describe("updateTask", () => {
    it("updates specific fields", () => {
      const id = useTaskStore.getState().addTask({
        title: "Original",
        category: "travail",
        priority: "moyenne",
      });

      useTaskStore.getState().updateTask(id, {
        title: "Updated",
        priority: "haute",
      });

      const task = useTaskStore.getState().tasks[0];
      expect(task.title).toBe("Updated");
      expect(task.priority).toBe("haute");
      expect(task.category).toBe("travail"); // unchanged
    });
  });

  describe("deleteTask", () => {
    it("removes a task", () => {
      const id = useTaskStore.getState().addTask({
        title: "Delete me",
        category: "travail",
        priority: "moyenne",
      });

      useTaskStore.getState().deleteTask(id);
      expect(useTaskStore.getState().tasks).toHaveLength(0);
    });

    it("only deletes the specified task", () => {
      useTaskStore.getState().addTask({
        title: "Keep",
        category: "travail",
        priority: "moyenne",
      });
      const id2 = useTaskStore.getState().addTask({
        title: "Delete",
        category: "perso",
        priority: "haute",
      });

      useTaskStore.getState().deleteTask(id2);
      const tasks = useTaskStore.getState().tasks;
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe("Keep");
    });
  });

  describe("getSubtasks", () => {
    it("returns subtasks for a parent", () => {
      const parentId = useTaskStore.getState().addTask({
        title: "Parent",
        category: "travail",
        priority: "haute",
      });

      useTaskStore.getState().addTask({
        title: "Child 1",
        category: "travail",
        priority: "moyenne",
        parentId,
      });
      useTaskStore.getState().addTask({
        title: "Child 2",
        category: "travail",
        priority: "basse",
        parentId,
      });
      useTaskStore.getState().addTask({
        title: "Other task",
        category: "perso",
        priority: "moyenne",
      });

      const subtasks = useTaskStore.getState().getSubtasks(parentId);
      expect(subtasks).toHaveLength(2);
      expect(subtasks[0].title).toBe("Child 1");
      expect(subtasks[1].title).toBe("Child 2");
    });

    it("returns empty for no subtasks", () => {
      const subtasks = useTaskStore.getState().getSubtasks("nonexistent");
      expect(subtasks).toHaveLength(0);
    });
  });
});
