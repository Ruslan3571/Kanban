import { useState } from 'react';
import './App.scss';
import axios from 'axios';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import Card from './Card/Card';

export const App = () => {
  const [repoName, setRepoName] = useState('');
  const [issues, setIssues] = useState(null);

  const GITHUB_API = 'https://api.github.com';

  async function getIssues(repoName) {
    return axios({
      url: `${GITHUB_API}/repos/${repoName}/issues?state=all`,
      method: 'GET',
      timeout: 2000,
    })
      .then(({ data }) => data)
      .catch(err => console.error(err));
  }
  async function blocks(repoName) {
    return getIssues(repoName)
      .then((issues = []) => {
        const lists = {
          toDo: [],
          inProgress: [],
          done: [],
        };

        if (!issues?.length) return lists;

        issues.forEach(iss => {
          if (iss?.state === 'open') {
            if (iss?.assigee) lists.inProgress.push(iss);
            else lists.toDo.push(iss);
          } else {
            lists.done.push(iss);
          }
        });

        return lists;
      })
      .catch(err => console.error(err));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const blocksData = await blocks(repoName);
    setIssues(blocksData);
  }

  const onDragEnd = result => {
    if (!result.destination) return;
    const { source, destination } = result;

   if (source.droppableId !== destination.droppableId) {
     const sourceColIndex = issues.findIndex(e => e.id === source.droppableId);
     const destinationColIndex = issues.findIndex(
       e => e.id === destination.droppableId
     );

    const sourceCol = issues[sourceColIndex];
    const destinationCol = issues[destinationColIndex];

     const sourceTask = [...sourceCol];
     const destinationTask = [...destinationCol];

     const [removed] = sourceTask.splice(source.index, 1);
     destinationTask.splice(destination.index, 0, removed);

      issues[sourceColIndex] = sourceTask;
      issues[destinationColIndex] = destinationTask;

     setIssues(issues);
   }
  };

  return (
    <>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form__container">
          <label>
            <input
              style={{ width: '500px' }}
              type="text"
              value={repoName}
              onChange={e => setRepoName(e.target.value)}
              placeholder="Enter repo URL ( for example ruslan3571/Kanban-Board )"
              required
            />
          </label>
          <input type="submit" value="Load issues" className="form__submit" />
        </div>
        <div className="form__repo">{repoName}</div>
      </form>

      {issues && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban">
            <Droppable droppableId="toDo">
              {provided => (
                <div
                  {...provided.droppableProps}
                  className="kanban__section"
                  ref={provided.innerRef}
                >
                  <div className="kanban__section__title">ToDo</div>
                  <div className="kanban__section__content">
                    {issues.toDo.map((issue, index) => (
                      <Draggable
                        key={issue.id.toString()}
                        draggableId={issue.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? '0.5' : '1',
                            }}
                          >
                            <Card> {issue.title}</Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>

            <Droppable droppableId="inProgress">
              {(provided, snapshot) => (
                <div
                  className="kanban__section"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="kanban__section__title">inProgress</div>
                  <div className="kanban__section__content">
                    {issues.inProgress.map((issue, index) => (
                      <Draggable
                        key={issue.id.toString()}
                        draggableId={issue.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? '0.5' : '1',
                            }}
                          >
                            <Card> {issue.title}</Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>

            <Droppable droppableId="done">
              {(provided, snapshot) => (
                <div
                  className="kanban__section"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="kanban__section__title">done</div>
                  <div className="kanban__section__content">
                    {issues.done.map((issue, index) => (
                      <Draggable
                        key={issue.id.toString()}
                        draggableId={issue.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? '0.5' : '1',
                            }}
                          >
                            <Card> {issue.title}</Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      )}
    </>
  );
};
