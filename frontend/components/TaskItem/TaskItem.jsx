import './TaskItem.scss';

const TaskItem = ({ task, onToggle, onDelete }) => {
    return (
        <div className="task-item">
            <label className="task-item__label">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={onToggle}
                    className="task-item__checkbox"
                />
                <span className={`task-item__text ${task.completed ? 'task-item__text--done' : ''}`}>
                    {task.text}
                </span>
            </label>
            <button className="task-item__delete" onClick={onDelete}>
                ×
            </button>
        </div>
    );
};

export default TaskItem;