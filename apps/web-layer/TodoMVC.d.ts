import * as vue from 'vue';
export interface Todo {
    id: number;
    title: string;
    completed: boolean;
}
export declare const filters: {
    all: (todos: Todo[]) => Todo[];
    active: (todos: Todo[]) => Todo[];
    completed: (todos: Todo[]) => Todo[];
};
declare const TodoMVC: vue.DefineComponent<{}, {}, {
    todos: Todo[];
    newTodo: string;
    editedTodo: Todo | null;
    visibility: "all" | "active" | "completed";
    beforeEditCache: string;
}, {
    filteredTodos: () => Todo[];
    remaining: () => number;
    allDone: {
        get: () => boolean;
        set: (value: boolean) => void;
    };
}, {
    addTodo: () => void;
    removeTodo: (todo: Todo) => void;
    editTodo: (todo: Todo) => void;
    doneEdit: (todo: Todo) => void;
    cancelEdit: (todo: Todo) => void;
    removeCompleted: () => void;
}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, vue.EmitsOptions, string, vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps, Readonly<{} & {}>, {}>;
export default TodoMVC;
