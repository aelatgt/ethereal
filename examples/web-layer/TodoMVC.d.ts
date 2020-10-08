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
declare const TodoMVC: {
    new (...args: any[]): vue.ComponentPublicInstance<{}, {}, {
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
    }, Record<string, any>, vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps, vue.ComponentOptionsBase<{}, {}, {
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
    }, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, Record<string, any>, string>>;
    __isFragment?: undefined;
    __isTeleport?: undefined;
    __isSuspense?: undefined;
} & vue.ComponentOptionsBase<{}, {}, {
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
}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, Record<string, any>, string> & {
    props?: undefined;
} & ThisType<vue.ComponentPublicInstance<{}, {}, {
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
}, Record<string, any>, Readonly<{}>, vue.ComponentOptionsBase<{}, {}, {
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
}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, Record<string, any>, string>>>;
export default TodoMVC;
