import TaskItem from '../TaskItem/TaskItem';
import './DayCard.scss';

const DayCard = ({ day, tasks, onAddTask, onToggleTask, onDeleteTask }) => {
const totalTasks = tasks.length;
const completedTasks = tasks.filter(t => t.completed).length;
const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

const radius = 28;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = circumference - (percentage / 100) * circumference;

return (
<div className="day-card">
    <div className="day-card__top">
        <div className="day-card__header">
            <h3 className="day-card__title">{day}</h3>
        </div>

        <div className="day-card__progress">
            <div className="day-card__progress-circle">
                <svg className="day-card__progress-svg" viewBox="0 0 80 80">
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        className="day-card__progress-bg"
                    />
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        className="day-card__progress-fill"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                    />
                </svg>
                <div className="day-card__progress-text">{percentage}%</div>
            </div>
        </div>

        <div className="day-card__tasks">
            {tasks.length === 0 ? (
                <p className="day-card__empty">Нет задач</p>
            ) : (
                tasks.map((task, index) => (
                    <TaskItem
                        key={index}
                        task={task}
                        onToggle={() => onToggleTask(index)}
                        onDelete={() => onDeleteTask(index)}
                    />
                ))
            )}
        </div>
    </div>

    <div className="day-card__bottom">
        <button className="day-card__add-btn" onClick={onAddTask}>
            + Add Task
        </button>
    </div>
</div>
);
};

export default DayCard;