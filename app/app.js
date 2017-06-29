import React from 'react';
import KanbanBoard from './KanbanBoard';
import ReactDOM from 'react-dom';

var cardsList = [
  {
    id : 1,
    title : "Read the Book",
    description: " I should read the whole book",
    status : 'in-progress',
    tasks: []
  },
  {
    id : 2 ,
    title : 'Write some code',
    description: "Code allong with the samples in the book",
    status : 'todo',
    tasks: [
      {
        id: 1,
        name: "ContactList Example",
        done: true
      },
      {
        id: 2,
        name: " Kanban Example",
        done: false
      },
      {
        id: 3,
        name: "My own experiments",
        done: false
      }
    ]
  },
];

ReactDOM.render(<KanbanBoard cards = {cardsList} />, document.getElementById("root"));
