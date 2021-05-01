const BASE_URL = 'http://localhost:9000';
const newTodoDescription = document.getElementById('new-todo-description');
const newTodoButton = document.getElementById('new-todo-button');

const makeRequest = async (url, data) => {
  return fetch(url, data).then((response) => response.json());
};

const addTodo = async (description) => {
  const response = await makeRequest(`${BASE_URL}/todo/add`, {
    method: 'POST',
    body: JSON.stringify({ description }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const tableBody = document.querySelector('tbody');
  const todoRow = document.createElement('tr');
  const todoDescriptionCell = document.createElement('td');

  todoDescriptionCell.innerText = response.description;
  todoRow.appendChild(todoDescriptionCell);
  tableBody.appendChild(todoRow);

  newTodoDescription.value = '';
  newTodoDescription.focus();
};

newTodoButton.addEventListener('click', async () => {
  await addTodo(newTodoDescription.value);
});
